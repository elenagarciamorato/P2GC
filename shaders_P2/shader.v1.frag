#version 330 core

#define NUM_LIGHTS 2

out vec4 outColor;
in vec3 color;
in vec3 vNormal;
in vec3 vPos;

//Struct Luz
struct Light
{
	vec3 Ia;
	vec3 Il; //Luz especular
	vec3 Pl; //Direcion de la luz
};

//Variables de la fuente de luz (Conjunto de luces)
Light lights[NUM_LIGHTS]=Light[NUM_LIGHTS](
	Light(vec3(0.1),vec3(1.0),vec3(0)),
	Light(vec3(0.1),vec3(1.0),vec3(2))
);


//Propiedades del objeto
vec3 Ka = vec3(1,0,0);
vec3 Kd = vec3(1,0,0);
vec3 Ks = vec3(1);
vec3 Ke;
float n = 100;
vec3 N;
vec3 Pp;

vec3 shade()
{
  vec3 c= vec3(0.0);
  N = normalize(N);

  c=(lights[0].Ia)*Ka;

  int i;
  for (i=0; i<NUM_LIGHTS; ++i)
  {  

	vec3 L = normalize(lights[i].Pl - Pp);
    float factor_difuso = dot(N,L);

    c+=clamp (lights[i].Il*Kd*factor_difuso,0,1);	

	vec3 R = normalize(reflect(-L,N));
	vec3 V = normalize(vec3(0)-Pp);

	float factor_especular = dot (R,V);
    factor_especular = pow(max (factor_especular,0),n);

    c+=clamp(lights[i].Il*Ks*factor_especular,0,1);

	c+=Ke;

  }

  return c;		
}

void main()
{

	Ka = color;
	Kd = color;

	Pp = vPos;
	N = vNormal;

	outColor = vec4(shade(), 0.0);   
}
