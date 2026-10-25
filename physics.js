export const G=9.80665;
export const dimensions={mass:[1,14.5939029372,'kg','slug'],length:[1,0.3048,'m','ft'],speed:[1,0.3048,'m/s','ft/s'],accel:[1,0.3048,'m/s²','ft/s²'],force:[1,4.44822161526,'N','lbf'],energy:[1,1.35581794833,'J','ft·lbf'],stiffness:[1,14.5939029372,'N/m','lbf/ft'],time:[1,1,'s','s'],angle:[1,1,'°','°'],none:[1,1,'','']};
export function unit(dim,system){return dimensions[dim][system==='imperial'?3:2];}
export function toDisplay(value,dim,system){return value/dimensions[dim][system==='imperial'?1:0];}
export function toSI(value,dim,system){return value*dimensions[dim][system==='imperial'?1:0];}
export const fields={m:['Mass','mass',0.001,1e6],m2:['Right mass','mass',0.001,1e6],angle:['Angle','angle',0,89],F:['Applied force (+ downhill/right)','force',-1e7,1e7],mus:['Static friction μs','none',0,10],muk:['Kinetic friction μk','none',0,10],v0:['Initial velocity','speed',-1e4,1e4],duration:['Observation time','time',0.01,120],speed:['Launch speed','speed',0,1e4],launch:['Launch angle','angle',0,90],height:['Launch height','length',0,1e6],k:['Spring constant','stiffness',0.001,1e7],x0:['Initial extension','length',-1e4,1e4],radius:['Radius','length',0.001,1e6],orbital:['Tangential speed','speed',0,1e5]};
export const models={
 surface:{name:'Surfaces & forces',icon:'◩',description:'One block on a fixed surface. Forces act along the plane; positive is downhill (right on a flat surface). Gravity and normal force are automatic. Drawing positions do not change constraints.',required:['block','surface'],allowed:['block','surface','force','friction'],targets:{a:['Acceleration','accel'],N:['Normal force','force'],friction:['Friction (signed)','force'],v:['Final velocity','speed'],s:['Displacement','length']},defaults:{m:5,angle:30,F:0,mus:0.3,muk:0.2,v0:0,duration:3},assumptions:'Rigid block, fixed plane, uniform gravity, Coulomb friction. Applied force is parallel to the plane. No collisions or surface boundaries.'},
 pulley:{name:'Pulley system',icon:'◎',description:'Ideal Atwood machine: two masses joined by a taut, massless rope over one fixed pulley. Positive acceleration is left mass down, right mass up.',required:['block','mass2','pulley'],allowed:['block','mass2','pulley'],targets:{a:['Acceleration','accel'],T:['Rope tension','force'],v:['Left velocity','speed'],s:['Left displacement','length']},defaults:{m:5,m2:3,v0:0,duration:2},assumptions:'One frictionless, massless fixed pulley; massless inextensible rope; no travel limits. Both masses have equal and opposite velocities.'},
 projectile:{name:'Projectile motion',icon:'↗',description:'A particle launched in uniform gravity, ending at ground impact. The canvas fits the complete trajectory.',required:['projectile'],allowed:['projectile'],targets:{range:['Range to impact','length'],flight:['Flight time','time'],peak:['Maximum height','length'],v:['Speed at observation','speed'],x:['Horizontal position','length'],y:['Vertical position','length']},defaults:{speed:15,launch:45,height:0,duration:2},assumptions:'Point particle, no air resistance, level ground at y = 0. Observation time is clamped to impact.'},
 spring:{name:'Spring motion',icon:'∿',description:'A mass on a horizontal spring oscillating about equilibrium. Positive extension is to the right.',required:['block','spring'],allowed:['block','spring'],targets:{period:['Period','time'],x:['Extension','length'],v:['Velocity','speed'],a:['Acceleration','accel'],energy:['Total energy','energy'],force:['Spring force','force']},defaults:{m:2,k:20,x0:0.5,v0:0,duration:2},assumptions:'Ideal linear spring, frictionless horizontal motion, no damping or spring mass. Extension is measured from equilibrium.'},
 circular:{name:'Circular motion',icon:'◌',description:'A particle traveling at constant speed in a horizontal circle. Inward force is the required net radial force.',required:['block','orbit'],allowed:['block','orbit'],targets:{a:['Centripetal acceleration','accel'],force:['Inward force','force'],period:['Orbital period','time']},defaults:{m:2,radius:3,orbital:4,duration:3},assumptions:'Uniform circular motion, constant radius and speed. Tangential acceleration is zero; the source of radial force is unspecified.'}
};
Object.assign(dimensions,{torque:[1,1.35581794833,'N·m','lbf·ft'],inertia:[1,1.35581794833,'kg·m²','slug·ft²'],angularSpeed:[1,1,'rad/s','rad/s'],angularAccel:[1,1,'rad/s²','rad/s²'],radians:[1,1,'rad','rad'],momentum:[1,4.44822161526,'kg·m/s','slug·ft/s']});
Object.assign(fields,{acceleration:['Constant acceleration','accel',-1e5,1e5],v2:['Right initial velocity','speed',-1e4,1e4],restitution:['Restitution e','none',0,1],inertia:['Moment of inertia','inertia',0.001,1e7],torque:['Net torque','torque',-1e7,1e7],omega0:['Initial angular velocity','angularSpeed',-1e4,1e4]});
Object.assign(models,{
 kinematics:{name:'Kinematics',icon:'→',description:'A particle moving along a straight line with prescribed constant acceleration. Positive motion is to the right.',required:['block'],allowed:['block'],targets:{s:['Displacement','length'],v:['Final velocity','speed'],a:['Acceleration','accel']},defaults:{m:1,v0:2,acceleration:3,duration:4},assumptions:'Point particle, rectilinear motion, constant prescribed acceleration. Mass does not affect this kinematic model.'},
 rotation:{name:'Rotational dynamics',icon:'⟳',description:'A rigid rotor about a fixed axis with constant net torque. Positive rotation is counterclockwise.',required:['rotor'],allowed:['rotor'],targets:{alpha:['Angular acceleration','angularAccel'],omega:['Angular velocity','angularSpeed'],theta:['Angular displacement','radians'],energy:['Rotational energy','energy'],work:['Work by torque','energy']},defaults:{inertia:2,torque:6,omega0:0,duration:3},assumptions:'Fixed axis and constant moment of inertia and net torque. No translational motion or unmodeled resisting torque.'},
 collision:{name:'Impulse & collision',icon:'⇄',description:'One-dimensional impact between two masses. Set signed pre-impact velocities; the animation shows approach, impact, and departure. The impact occurs at t = 1 s in the schematic.',required:['block','mass2'],allowed:['block','mass2'],targets:{v1:['Left final velocity','speed'],v2:['Right final velocity','speed'],impulse:['Impulse on left','momentum'],loss:['Energy dissipated','energy']},defaults:{m:3,m2:2,v0:5,v2:-1,restitution:0.8,duration:3},assumptions:'Isolated instantaneous one-dimensional collision; no external impulse. Coefficient of restitution is between 0 (perfectly inelastic) and 1 (elastic). Approach requires left velocity > right velocity.'}
});
export function validate(model,p){
 if(!models[model]) throw Error('Unknown model');
 for(const key of Object.keys(models[model].defaults)){
  const f=fields[key];if(!Number.isFinite(p[key])||p[key]<f[2]||p[key]>f[3])throw Error(`${f[0]} is outside its supported range.`);
 }
 if(model==='collision'&&p.v0<=p.v2)throw Error('For an approaching collision, left velocity must exceed right velocity.');
 if(model==='surface'&&p.muk>p.mus)throw Error('Kinetic friction must be no greater than static friction.');
}
// Exact piecewise motion under a constant driving force and Coulomb friction.
export function surfaceMotion(p,t,hasForce=true,hasFriction=true){
 const theta=p.angle*Math.PI/180,N=p.m*G*Math.cos(theta),drive=p.m*G*Math.sin(theta)+(hasForce?p.F:0);
 const fs=hasFriction?p.mus*N:0,fk=hasFriction?p.muk*N:0;
 const restA=Math.abs(drive)<=fs?0:(drive-Math.sign(drive)*fk)/p.m;
 let a=p.v0===0?restA:(drive-Math.sign(p.v0)*fk)/p.m;
 const initialA=a,initialFriction=p.m*a-drive;
 const stop=p.v0*a<0?-p.v0/a:Infinity;
 let s,v;
 if(t>=stop){const remaining=t-stop;s=p.v0*stop+0.5*a*stop*stop+0.5*restA*remaining*remaining;v=restA*remaining;a=restA;}
 else{s=p.v0*t+0.5*a*t*t;v=p.v0+a*t;}
 return {a:initialA,N,friction:initialFriction,s,v,instantA:a,stop,drive,fs,fk};
}
const n=x=>Number(x.toPrecision(6)).toString();
export function solve(model,p,parts,t=p.duration){
 validate(model,p);
 const present=kind=>parts.some(e=>e.kind===kind);
 const missing=models[model].required.filter(k=>!present(k));
 if(missing.length)throw Error('Add the required elements: '+missing.join(', ')+'.');
 const steps=[];let values;
 const step=(title,detail,latex)=>steps.push({title,detail,latex});
 if(model==='surface'){
  values=surfaceMotion(p,t,present('force'),present('friction'));
  const {N,drive,fs,fk,a,stop}=values;
  step('Resolve the forces','Work along the plane; positive is downhill, or right on a flat surface.',`N=mg\\cos\\theta=${n(N)}\\,\\mathrm{N} \\qquad D=mg\\sin\\theta+F=${n(drive)}\\,\\mathrm{N}`);
  step('Determine the friction regime',p.v0===0&&Math.abs(drive)<=fs?'Static friction balances the driving force; the block remains at rest.':'Kinetic friction opposes motion. If motion stops, re-evaluate the static threshold.',`f_{s,\\max}=\\mu_sN=${n(fs)}\\,\\mathrm{N},\\quad f_k=\\mu_kN=${n(fk)}\\,\\mathrm{N}`);
  step('Apply Newton’s second law','Acceleration and signed friction below refer to the initial state.',`a_0=\\frac{D+f_0}{m}=${n(a)}\\,\\mathrm{m/s^2},\\quad f_0=${n(values.friction)}\\,\\mathrm{N}`);
  step('Integrate the motion',t>=stop?'The block stops at '+n(stop)+' s. Split the trajectory there and reapply the friction law.':'Constant acceleration applies over this observation interval.',`v=v_0+\\int_0^t a(\\tau)\\,d\\tau=${n(values.v)}\\,\\mathrm{m/s},\\quad s=\\int_0^t v(\\tau)\\,d\\tau=${n(values.s)}\\,\\mathrm{m}`);
 }else if(model==='pulley'){
  const a=(p.m-p.m2)*G/(p.m+p.m2),T=2*p.m*p.m2*G/(p.m+p.m2);values={a,T,v:p.v0+a*t,s:p.v0*t+0.5*a*t*t};
  step('Write the force balances','Choose left-down and right-up as positive along the rope.',`m_1g-T=m_1a,\\qquad T-m_2g=m_2a`);
  step('Eliminate the tension','Add the equations; the rope enforces equal acceleration magnitudes.',`a=\\frac{(m_1-m_2)g}{m_1+m_2}=\\frac{(${n(p.m)}-${n(p.m2)})${G}}{${n(p.m+p.m2)}}=${n(a)}\\,\\mathrm{m/s^2}`);
  step('Recover tension and motion','A negative acceleration means the right mass accelerates downward.',`T=m_1(g-a)=${n(T)}\\,\\mathrm{N} \\qquad v=v_0+at=${n(values.v)}\\,\\mathrm{m/s} \\qquad s=v_0t+\\tfrac12at^2=${n(values.s)}\\,\\mathrm{m}`);
 }else if(model==='projectile'){
  const theta=p.launch*Math.PI/180,vx=p.speed*Math.cos(theta),vy=p.speed*Math.sin(theta),flight=(vy+Math.sqrt(vy*vy+2*G*p.height))/G;
  const time=Math.min(t,flight);values={range:vx*flight,flight,peak:p.height+vy*vy/(2*G),x:vx*time,y:Math.max(0,p.height+vy*time-G*time*time/2),v:Math.hypot(vx,vy-G*time),vx,vy,time};
  step('Resolve the launch velocity','Horizontal velocity is constant; gravity changes vertical velocity.',`v_{x0}=v_0\\cos\\theta=${n(vx)}\\,\\mathrm{m/s},\\quad v_{y0}=v_0\\sin\\theta=${n(vy)}\\,\\mathrm{m/s}`);
  step('Solve for impact','Set y = 0 and take the nonnegative root.',`t_f=\\frac{v_{y0}+\\sqrt{v_{y0}^2+2gh}}{g}=${n(flight)}\\,\\mathrm{s},\\quad R=v_{x0}t_f=${n(values.range)}\\,\\mathrm{m}`);
  step('Find height and position',`Evaluate at t = ${n(time)} s (clamped to impact).`,`h_{\\max}=h+\\frac{v_{y0}^2}{2g}=${n(values.peak)}\\,\\mathrm{m} \\qquad x=v_{x0}t=${n(values.x)}\\,\\mathrm{m},\\quad y=h+v_{y0}t-\\tfrac12gt^2=${n(values.y)}\\,\\mathrm{m}`);
  step('Combine velocity components','Speed is the magnitude of the velocity vector.',`v=\\sqrt{v_{x0}^2+(v_{y0}-gt)^2}=${n(values.v)}\\,\\mathrm{m/s}`);
 }else if(model==='spring'){
  const w=Math.sqrt(p.k/p.m),x=p.x0*Math.cos(w*t)+p.v0/w*Math.sin(w*t),v=-p.x0*w*Math.sin(w*t)+p.v0*Math.cos(w*t);
  values={period:2*Math.PI/w,x,v,a:-w*w*x,force:-p.k*x,energy:0.5*p.k*p.x0*p.x0+0.5*p.m*p.v0*p.v0,w};
  step('Set up the oscillator','Hooke’s law supplies the restoring force.',`m\\ddot x=-kx,\\qquad \\omega=\\sqrt{\\frac{k}{m}}=${n(w)}\\,\\mathrm{rad/s}`);
  step('Apply initial conditions','This solution includes both initial displacement and initial velocity.',`x(t)=x_0\\cos(\\omega t)+\\frac{v_0}{\\omega}\\sin(\\omega t)=${n(x)}\\,\\mathrm{m}`);
  step('Differentiate and recover force','Force and acceleration always point toward equilibrium.',`v(t)=-x_0\\omega\\sin(\\omega t)+v_0\\cos(\\omega t)=${n(v)}\\,\\mathrm{m/s} \\qquad F=-kx=${n(values.force)}\\,\\mathrm{N}`);
  step('Find period and conserved energy','Mechanical energy stays constant in the ideal undamped system.',`P=\\frac{2\\pi}{\\omega}=${n(values.period)}\\,\\mathrm{s},\\quad E=\\tfrac12kx_0^2+\\tfrac12mv_0^2=${n(values.energy)}\\,\\mathrm{J}`);
 }else if(model==='circular'){
  const a=p.orbital*p.orbital/p.radius;values={a,force:p.m*a,period:p.orbital===0?Infinity:2*Math.PI*p.radius/p.orbital};
  step('Follow the changing direction','Speed is constant, but velocity changes direction toward the center.',`a_c=\\frac{v^2}{r}=\\frac{${n(p.orbital)}^2}{${n(p.radius)}}=${n(a)}\\,\\mathrm{m/s^2}`);
  step('Find the required radial force','This is the net inward force needed to maintain the circle.',`F_c=ma_c=${n(p.m)}\\cdot${n(a)}=${n(values.force)}\\,\\mathrm{N}`);
  step('Find the period',p.orbital===0?'At zero speed, no orbit is completed; the period is infinite.':'One orbit traverses the circumference.',p.orbital===0?'P=\\infty':`P=\\frac{2\\pi r}{v}=${n(values.period)}\\,\\mathrm{s}`);
 }
 if(model==='kinematics'){
  values={a:p.acceleration,v:p.v0+p.acceleration*t,s:p.v0*t+0.5*p.acceleration*t*t};
  step('Prescribe the acceleration','Acceleration is the rate of change of velocity.',`a=\\frac{dv}{dt}=${n(p.acceleration)}\\,\\mathrm{m/s^2}`);
  step('Integrate for velocity','Use the initial velocity at t = 0.',`v=v_0+at=${n(p.v0)}+${n(p.acceleration)}\\cdot${n(t)}=${n(values.v)}\\,\\mathrm{m/s}`);
  step('Integrate for displacement','Displacement is signed; it can differ from total distance traveled.',`s=v_0t+\\tfrac12at^2=${n(p.v0)}\\cdot${n(t)}+\\tfrac12\\cdot${n(p.acceleration)}\\cdot${n(t)}^2=${n(values.s)}\\,\\mathrm{m}`);
 }else if(model==='rotation'){
  const alpha=p.torque/p.inertia,omega=p.omega0+alpha*t,theta=p.omega0*t+0.5*alpha*t*t;
  values={alpha,omega,theta,energy:0.5*p.inertia*omega*omega,work:p.torque*theta};
  step('Apply rotational Newton’s law','Use net torque about the fixed rotation axis.',`\\alpha=\\frac{\\tau}{I}=\\frac{${n(p.torque)}}{${n(p.inertia)}}=${n(alpha)}\\,\\mathrm{rad/s^2}`);
  step('Integrate angular motion','Constant torque and inertia give constant angular acceleration.',`\\omega=\\omega_0+\\alpha t=${n(omega)}\\,\\mathrm{rad/s},\\quad \\theta=\\omega_0t+\\tfrac12\\alpha t^2=${n(theta)}\\,\\mathrm{rad}`);
  step('Evaluate energy and work','Work equals the change in rotational kinetic energy.',`K=\\tfrac12I\\omega^2=${n(values.energy)}\\,\\mathrm{J},\\quad W=\\tau\\theta=${n(values.work)}\\,\\mathrm{J}`);
 }else if(model==='collision'){
  const v1=(p.m*p.v0+p.m2*p.v2-p.m2*p.restitution*(p.v0-p.v2))/(p.m+p.m2),v2=v1+p.restitution*(p.v0-p.v2);
  values={v1,v2,impulse:p.m*(v1-p.v0),loss:0.5*p.m*p.v0*p.v0+0.5*p.m2*p.v2*p.v2-0.5*p.m*v1*v1-0.5*p.m2*v2*v2};
  step('Conserve linear momentum','There is no external impulse during the collision.',`m_1u_1+m_2u_2=m_1v_1+m_2v_2=${n(p.m*p.v0+p.m2*p.v2)}\\,\\mathrm{kg\\,m/s}`);
  step('Apply restitution','The relative separation speed is e times the relative approach speed.',`v_2-v_1=e(u_1-u_2)=${n(p.restitution*(p.v0-p.v2))}\\,\\mathrm{m/s}`);
  step('Solve the simultaneous equations','Both final velocities are signed in the same global direction.',`v_1=\\frac{m_1u_1+m_2u_2-m_2e(u_1-u_2)}{m_1+m_2}=${n(v1)}\\,\\mathrm{m/s},\\quad v_2=${n(v2)}\\,\\mathrm{m/s}`);
  step('Calculate impulse and energy loss','Total momentum is conserved; kinetic energy is conserved only for e = 1.',`J_1=m_1(v_1-u_1)=${n(values.impulse)}\\,\\mathrm{N\\,s},\\quad K_i-K_f=${n(values.loss)}\\,\\mathrm{J}`);
 }
 return {values,steps};
}
