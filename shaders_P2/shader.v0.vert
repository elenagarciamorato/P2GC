#version 330 core
//https://www.geeks3d.com/20091013/shader-library-phong-shader-with-multiple-lights-glsl/

#define NUM_LIGHTS 2

in vec3 inPos;	
in vec3 inColor;
in vec3 inNormal;

uniform mat4 modelViewProj;
uniform mat4 modelView;
uniform mat4 normal;
out vec3 color;

//Struct Luz
struct Light
{
	vec3 Ia;
	vec3 Il;
	vec3 Pl;
};

Light lights[NUM_LIGHTS]=Light[NUM_LIGHTS](
	Light(vec3(0.1),vec3(1.0),vec3(0)),
	Light(vec3(0.1),vec3(1.0),vec3(0))
);


//Variables de la fuente de luz 1
//vec3 Ia1 = vec3(0.1);
//vec3 Il1 = vec3(1.0);
//vec3 Pl1 = vec3(0);

//lights[0].Ia = vec3(0.1);
//lights[0].Il = vec3(1.0);
//lights[0].Pl = vec3(0);

//Variables de la fuente de luz 2

//lights[1].Ia = vec3(0.1);
//lights[1].Il = vec3(1.0);
//lights[1].Pl = vec3(0);


//Propiedades del objeto
vec3 Ka = vec3(1,0,0);
vec3 Kd = vec3(1,0,0);
vec3 Ks = vec3(1);
float n = 20;
vec3 N;
vec3 Pp;



//vec3 shade()
//{
//	vec3 c= vec3(0.0);

//	c=Ia1*Ka;

//	N = normalize(N);
//	vec3 L = normalize(lights[0].Pl - Pp);
//	float factor_difuso = dot(N,L);
//	c+=clamp (Il1*Kd*factor_difuso,0,1);

//	vec3 R = normalize(reflect(-L,N));
//	vec3 V = normalize(vec3(0)-Pp);
//	float factor_especular = dot (R,V);
//	factor_especular = pow(max (factor_especular,0),n);
//	c+=clamp(Il1*Ks*factor_especular,0,1);

	
//	return c;

////////////////////////////////////////

vec3 shade()
{
  vec3 c= vec3(0.0);
  N = normalize(N);

  //c=(lights[0].Ia)*Ka;

  int i;
  for (i=0; i<NUM_LIGHTS; ++i)
  {  
    vec3 L = normalize(lights[1].Pl - Pp);
    float factor_difuso = dot(N,L);

      c+=clamp (lights[i].Il*Kd*factor_difuso,0,1);	

	  vec3 R = normalize(reflect(-L,N));
	  vec3 V = normalize(vec3(0)-Pp);

	  float factor_especular = dot (R,V);
      factor_especular = pow(max (factor_especular,0),n);

      c+=clamp(lights[i].Il*Ks*factor_especular,0,1);

  }

  return c;		
}

void main()
{
	//Ka = inColor;
	N = (normal*vec4(inNormal,0.0)).xyz;
	Pp= (modelView*vec4(inPos,1.0)).xyz;

	color = shade();


	gl_Position =  modelViewProj * vec4 (inPos,1.0);
}
