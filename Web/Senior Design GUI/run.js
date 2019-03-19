/*
Author: Kyle Semelka
Email: kylesemelka@gmail.com
*/

var ros;
var controlClient;

var tfClient;

var canvas;
var canvasWidth;
var ctx;

var currently_locked = false;
var load_offset = 0;

function init() {
  ros = new ROSLIB.Ros({
    url : 'ws://10.25.12.111:9090'
  });

  // If there is an error on the backend, an 'error' emit will be emitted.
  ros.on('error', function(error) {
    console.log(error);
    $('#connecting').hide();
    $('#error').show();
    $('#closed').hide();
    $('#connected').hide();
  });

  // Find out exactly when we made a connection.
  ros.on('connection', function() {
    console.log('Connection made!');
    $('#connecting').hide();
    $('#error').hide();
    $('#closed').hide();
    $('#connected').show();
  });

  ros.on('close', function() {
    console.log('Connection closed.');
    $('#connecting').hide();
    $('#error').hide();
    $('#closed').show();
    $('#connected').hide();
  });

  // Action Lib client for moving TurtleBot
  //---------------------
  controlClient = new ROSLIB.ActionClient({                                                
    ros : ros,
    serverName: '/robot_1/move_base',
    actionName: 'MoveBaseAction'                                      
  });

  // TF Client to receive position data of robot
  //---------------------
  // tfClient = new ROSLIB.TFClient({
  //   ros : ros,
  //   fixedFrame : 'robot_1/base_link',
  //   angularThres : 0.01,
  //   transThres : 0.01
  // });

  // tfClient.subscribe('robot_1/map', function(tf) {
  //   console.log('Got TF Message.');
  //   console.log(tf);
  //   // document.getElementById('x-position').innerHTML = tf.translation.x;
  //   // document.getElementById('y-position').innerHTML = tf.translation.y;
  // });

  //Subscribing to Robot Status Listener
  //----------------------
  const robot_state_listener = new ROSLIB.Topic({
      ros : ros,
      name : '/sm_state',
      messageType : 'std_msgs/String'
  });

  // Then we add a callback to be called every time a message is published on this topic.
  robot_state_listener.subscribe(function(message) {
    console.log('Received message on ' + robot_state_listener.name + ': ' + message.data);

    $('#menu').css('opacity', '0.3');
    $('#approach').css('opacity', '0.3');
    $('#lock').css('opacity', '0.3');
    $('#plan').css('opacity', '0.3');
    $('#dock').css('opacity', '0.3');
    $('#move').css('opacity', '0.3');
    $('#undock').css('opacity', '0.3');
    $('#go_home').css('opacity', '0.3');
    $('#cleanup').css('opacity', '0.3');

    if (message.data === "MENU") {
      $('#menu').css('opacity', '1');
    } else if (message.data === "APPROACH") {
      $('#approach').css('opacity', '1');
    } else if (message.data === "LOCK") {
      $('#lock').css('opacity', '1');
    } else if (message.data === "PLAN") {
      $('#plan').css('opacity', '1');
    } else if (message.data === "DOCK") {
      $('#dock').css('opacity', '1');
    } else if (message.data === "MOVE") {
      $('#move').css('opacity', '1');
    } else if (message.data === "UNDOCK") {
      $('#undock').css('opacity', '1');
    } else if (message.data === "HOME") {
      $('#go_home').css('opacity', '1');
    } else if (message.data === "CLEANUP") {
      $('#cleanup').css('opacity', '1');
    } else {
      console.log('Error: ' + robot_state_listener.name + ' received \'' + message.data + '\' which doesn\'t match any states.');
    }
  });

  //Subscribing to battery status Listener
  //--------------------------------
  const battery_status_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_1/mobile_base/sensors/core',
    messageType : 'kobuki_msgs/SensorState'
  });

  battery_status_listener.subscribe(function(message) {
    let battery_percentage = (message.battery / 161) * 100;
    $('#battery_info').html(Math.trunc(battery_percentage) + '% charged');
  });

  //Subscribing to AR Tag x pos Listener
  //--------------------------------
  const ar_tag_x_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_2/ar_tag_x_pos',
    messageType : 'std_msgs/Float32'
  });

  // Then we add a callback to be called every time a message is published on this topic.
  ar_tag_x_listener.subscribe(function(message) {
    $('#ar_tag_position_x').html(message.data.toFixed(4));
  });

  //Subscribing to AR Tag y pos Listener
  //--------------------------------
  const ar_tag_y_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_2/ar_tag_y_pos',
    messageType : 'std_msgs/Float32'
  });

  // Then we add a callback to be called every time a message is published on this topic.
  ar_tag_y_listener.subscribe(function(message) {
    $('#ar_tag_position_y').html(message.data.toFixed(4));
  });

  //Subscribing to robot 1 pos Listener
  //--------------------------------
  const robot_1_pos_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_1/odom',
    messageType : 'nav_msgs/Odometry'
  });

  // Then we add a callback to be called every time a message is published on this topic.
  robot_1_pos_listener.subscribe(function(message) {
    $('#robot_1_position_x').html(message.pose.pose.position.x.toFixed(4));
    $('#robot_1_position_y').html(message.pose.pose.position.y.toFixed(4));
  });

  //Subscribing to robot 2 pos Listener
  //--------------------------------
  const robot_2_pos_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_2/odom',
    messageType : 'nav_msgs/Odometry'
  });

  // Then we add a callback to be called every time a message is published on this topic.
  robot_2_pos_listener.subscribe(function(message) {
    // console.log(message.pose.pose.position.x);
    $('#robot_2_position_x').html(message.pose.pose.position.x.toFixed(4));
    $('#robot_2_position_y').html(message.pose.pose.position.y.toFixed(4));
  });

  // //Subscribing to AR Tag y pos Listener
  // //--------------------------------
  // const ar_tag_y_listener = new ROSLIB.Topic({
  //   ros : ros,
  //   name : '/robot_2/ar_tag_y_pos',
  //   messageType : 'std_msgs/Float32'
  // });

  // // Then we add a callback to be called every time a message is published on this topic.
  // ar_tag_y_listener.subscribe(function(message) {
  //   // console.log("AR Tag y: " + message.data);
  //   let pos = message.data;
  //   pos = pos.substring(0,5);
  //   $('#ar_tag_position_y').html(pos);
  // });

  //Subscribing to Robot Load Listener
  //--------------------------------
  const robot_load_listener = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_load',
    messageType : 'std_msgs/Float32',
    queue_size : 0
  });

  // Then we add a callback to be called every time a message is published on this topic.
  robot_load_listener.subscribe(function(message) {
    const load = message.data - load_offset;
    if (load > 100) {
      $('#robot-load').html('Too Heavy!!');
    }
    else {
      // $('#robot-load').html(Math.trunc(load));
      $('#robot-load').html('Measuring weight...');
    }
    // console.log(load);
  });

  // Nav viewer
  //---------------------------------
  // Create the main viewer.
  // var viewer = new ROS2D.Viewer({
  //   divID : 'map',
  //   height : 400,
  //   width : 545
  // });

  // Setup the nav client.
  // const nav = NAV2D.OccupancyGridClientNav({
  //   ros : ros,
  //   rootObject : viewer.scene,
  //   viewer : viewer,
  //   continuous : true,
  //   topic : '/robot_1/map'
  // });

  const gridClient = new ROS2D.OccupancyGridClient({
    ros : ros,
    rootObject : viewer.scene,
    continuous : true,
    topic : '/robot_1/map'
  });

  gridClient.on('change', function(){
    viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
    viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
  });

  var imageTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/robot_1/camera/image_raw/compressed',
    messageType : 'sensor_msgs/CompressedImage',
    throttle_rate : 166,
    queue_size : 0
  });

  imageTopic.subscribe(function(message) {
    const imagedata = "data:image/jpg;base64," + message.data;

    const cam = document.getElementById("camera");
    const ctx = cam.getContext("2d");

    let image = new Image();
    image.onload = function() {
      ctx.drawImage(image, 0, 0);
    };
    image.src = imagedata;
  });

  // Initialize timer
  const timer = document.getElementById("timer");
  aTimer = new Stopwatch(timer);
  aTimer.reset();
}

function stop() {
  $('#startButton').prop('disabled', false);
  $('#stopButton').prop('disabled', true);

  var stop = new ROSLIB.Topic({
    ros : ros,
    name : '/emergency_stop',
    messageType : 'std_msgs/Bool'
  });

  // Then we create the payload to be published.
  var stop_flag = new ROSLIB.Message({ data : true });

  // And finally, publish.
  stop.publish(stop_flag);

  aTimer.stop();
  aTimer.reset();
}

function start() {
  // document.getElementById("startButton").innerHTML = "Starting...";
  $('#startButton').prop('disabled', true);
  $('#stopButton').prop('disabled', false);
  aTimer.start();
}

function publish_lock_state() {
  let lock_topic = new ROSLIB.Topic({
    ros : ros,
    name : '/toggle_relay',
    messageType : 'std_msgs/Bool'
  });

  // Then we create the payload to be published.
  let lock_message;
  if (currently_locked) {
    lock_message = new ROSLIB.Message({data : false});
    currently_locked = false;
  }
  else {
    lock_message = new ROSLIB.Message({data : true});
    currently_locked = true;
  }

  // And finally, publish.
  lock_topic.publish(lock_message);

  if (currently_locked) {
    console.log("Magnet is now locked.");
  }
  else {
    console.log("Magnet is now unlocked.");
  }
  
}

function send_waypoint_1() {
  // let waypoints = $('coordinatesForm').serializeArray();

  let form = document.getElementById('coordinatesForm');
  let x = form.elements[0].value;
  let y = form.elements[1].value;
  let yaw = form.elements[2].value;

  console.log("Sending waypoint to robot:" + 
              "\n\tx: " + x + 
              "\n\ty: " + y +
              "\n\tyaw: " + yaw);

  //Create the goal
  let goal = new ROSLIB.Goal({
    actionClient : controlClient,
    goalMessage : {
      target_pose : {
        header : {
          frame_id : "robot_1/map"
        },
        pose : {
          position : {
            x: x,
            y: y,
            z: .263
          },
          orientation : {
            x: 0,
            y: 0,
            z: 0,
            w: 1
          }
        }
      }
    }
  });

  //Send the goal to the server to execute the callbacks
  goal.send();
}

function send_waypoint_2() {
  // let waypoints = $('coordinatesForm').serializeArray();

  let form = document.getElementById('coordinatesForm');
  let x = form.elements[0].value;
  let y = form.elements[1].value;
  let yaw = form.elements[2].value;

  console.log("Sending waypoint to robot:" + 
              "\n\tx: " + x + 
              "\n\ty: " + y +
              "\n\tyaw: " + yaw);

  // Create the goal
  let goal = new ROSLIB.Goal({
    actionClient : controlClient,
    goalMessage : {
      target_pose : {
        header : {
          frame_id : "robot_2/map"
        },
        pose : {
          position : {
            x: x,
            y: y,
            z: .263
          },
          orientation : {
            x: 0,
            y: 0,
            z: 0,
            w: 1
          }
        }
      }
    }
  });

  //Send the goal to the server to execute the callbacks
  goal.send();
}

function go_home() {
  console.log("Sending waypoint to robot:" + 
              "\n\tx: " + 0 + 
              "\n\ty: " + 0 +
              "\n\tyaw: " + 0);

  //Create the goal
  const goal = new ROSLIB.Goal({
    actionClient : controlClient,
    goalMessage : {
      target_pose : {
        header : {
          frame_id : "robot_1/map"
        },
        pose : {
          position : {
            x: 0,
            y: 0,
            z: .263
          },
          orientation : {
            x: 0,
            y: 0,
            z: 0,
            w: 1
          }
        }
      }
    }
  });

  //Send the goal to the server to execute the callbacks
  goal.send();
}