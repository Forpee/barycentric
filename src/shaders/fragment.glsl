uniform float uTime;

varying vec2 vUv;
varying vec3 vBarycentric;

void main()
{
    vec3 b=vBarycentric;
    float width=.01;
    
    // float borderx=max(step(vUv.x,width),step(1.-vUv.x,width));
    // float bordery=max(step(vUv.y,width),step(1.-vUv.y,width));
    // float border=max(borderx,bordery);
    
    float border=max(max(step(b.x,width),step(b.y,width)),step(b.z,width));
    vec3 color=vec3(border);
    
    gl_FragColor=vec4(vUv,1.,1.);
    gl_FragColor=vec4(color,1.);
}