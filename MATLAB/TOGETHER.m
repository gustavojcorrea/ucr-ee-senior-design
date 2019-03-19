x = [1.325, .96, .605, .438, .204, .15]
y = [.376, .425, .27, .15, .08, .034]

a = x'\y';

plot(x,y,'*')
title('AR Tag to Robot Displacement')
hold on
plot(x,a*x)
xlabel('x (m)')
ylabel('y (m)')

p = polyfit(x,a*x,1)
%y =.35x + 0

str = {'y = .35x '};
text(.6,.2,str)
hold on
%y =.35x + 0

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

x2 = [1.488, 1.294, .495, .363, .231, .167]
y2 = [.008, .007, .0035, .0015, .001, .013]

a2 = x2'\y2';

plot(x2,y2,'*')

hold on
plot(x,a2*x2)
hold on
p2 = polyfit(x2,a2*x2,1)
%y =.0059x + 0

str = {'y = .0059x '};
text(1,.01,str)
hold on

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

x3 = [1.59, .993, .909, .659, .495, .226, .169]
y3 = [-.764, -.486, -.462, -.289, -.240, -.069, .053]

a3 = x3'\y3';
%plot(x,y,'*',x,a*x)

plot(x3,y3,'*')

hold on
plot(x3,a3*x3)
hold on

p3 = polyfit(x3,a3*x3,1)
%y =-.4772x + 0

str = {'y = -0.4772x '};
text(1,-.4,str)
hold on

lgd = legend('Left Points', 'Left Best-Fit', 'Center Points', 'Center Best-Fit', 'Right Points' , 'Right Best-Fit');
set(legend, 'NumColumns', 2)
title('AR Tag to Robot Displacement')