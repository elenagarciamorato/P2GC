#version 330 core

#define NUM_LIGHTS 2

out vec4 outColor;
in vec3 color;
in vec3 vNormal;
in vec3 vPos;

uniform mat4 view;

//Struct Luz
struct Light
{
	vec3 Ia;
	vec3 Il; //Luz especular (intensidad de la luz)
	vec3 Pl; //Posicion de la luz
};

//Variables de la fuente de luz (Conjunto de luces)
Light lights[NUM_LIGHTS]=Light[NUM_LIGHTS](
	Light(vec3(0.5),vec3(0.6),vec3(0, 0, 4)),
	Light(vec3(0.5),vec3(0.6),vec3(3, 0 ,-6)) //(la z mira hacia las posiciones negativas)
);

//Para q no se mueva la luz Pl*MatrizView (Hay q modificar Pl=vec3(0) y ponerlo en otro sitio q no sea el 0)
//Para utilizar view en el shader de fragmentos -> uniform math4 view;
//Para normalizar, si es un punto=0, si es un vector=1)


//Luz focal: parametros requeridos= Il Pl alpha D
//Puntual Il Pl
//Direccional Il L

//Propiedades del objeto
vec3 Ka = vec3(1,0,0);
vec3 Kd = vec3(1,0,0);
vec3 Ks = vec3(1);
vec3 Ke = vec3(0);
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

	float d = length (lights[i].Pl - Pp);
	float fatt = 1/(1 + 0 * d + 0.2*d*d);

	vec3 L = normalize(lights[i].Pl- Pp);
    float factor_difuso = dot(N,L);

    c+=clamp (lights[i].Il*Kd*factor_difuso*fatt,0,1);	

	vec3 R = normalize(reflect(-L,N));
	vec3 V = normalize(vec3(0)-Pp);

	float factor_especular = dot (R,V);
    factor_especular = pow(max (factor_especular,0),n);

    c+=clamp(lights[i].Il*Ks*factor_especular*fatt,0,1);

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
