#version 330 core

#define NUM_PLIGHTS 2  //Luz Puntual
#define NUM_DLIGHTS 1  //Luz Direccional
#define NUM_SLIGHTS 1  //Luz Focal

out vec4 outColor;
in vec3 color;
in vec3 vNormal;
in vec3 vPos;

uniform mat4 view;


//Struct Luz Puntual
struct PLight
{
	vec3 Ia; //Componente ambiental
	vec3 Il; //Intensidad de la luz
	vec3 Pl; //Posicion de la luz
};

//Struct Luz Direccional
struct DLight
{
	vec3 Ia; //Componente ambiental
	vec3 Il; //Intensidad de la Luz
	vec3 L; 
};


//Struct Luz Focal
struct SLight
{
	vec3 Ia; //Componente ambiental
	vec3 Il; //Intensidad de la luz
	vec3 Pl; //Posicion de la luz
	vec3 D;	 // Direccion de la luz (En este caso, establecemos que sea la misma de la camara)
	float alpha; //Angulo de apertura
};


//Variables de la fuente de luz (Conjunto de luces PUNTUALES)
PLight plights[2] = PLight[2](
	PLight(vec3(0.5),vec3(1.5),vec3(0, 0, 1)),
	PLight(vec3(0.5),vec3(1),vec3(3, 0 ,-6)) //(la z mira hacia las posiciones negativas)
);

//Variables de la fuente de luz (Conjunto de luces DIRECCIONALES)
DLight dlights[1] = DLight[1](
	DLight(vec3(0.4),vec3(0.6),vec3(0, 0, 1))
);

//Variables de la fuente de luz (Conjunto de luces FOCALES)
SLight slights[1] = SLight[1](
	SLight(vec3(0.4),vec3(2),vec3(0, 0, 0),vec3(0,0,-1),float(0.2))
);


//Para utilizar view en el shader de fragmentos -> uniform math4 view;

//Propiedades del objeto
vec3 Ka = vec3(1,0,0);
vec3 Kd = vec3(1,0,0);
vec3 Ks = vec3(1);
vec3 Ke = vec3(0);
float n = 100;
vec3 N;
vec3 Pp;

//Struct Niebla
struct Fog
{
	float df;
	vec3 cf;

};

//Valor de las variables de la niebla
Fog fog = Fog(0.1, vec3(0,0,0));



vec3 shadePLight()
{
  vec3 c= vec3(0.0);

  c=(plights[0].Ia)*Ka;

  for (int i=0; i<NUM_PLIGHTS; ++i)
  {  
	float d = length (plights[i].Pl - Pp);
	float fatt = 1/(1 + 0 * d + 0.2*d*d);

	vec3 L = normalize(plights[i].Pl- Pp);
    float factor_difuso = dot(N,L);

    c+=clamp (plights[i].Il*Kd*factor_difuso*fatt,0,1);	

	vec3 R = normalize(reflect(-L,N));
	vec3 V = normalize(vec3(0)-Pp);

	float factor_especular = dot (R,V);
    factor_especular = pow(max (factor_especular,0),n);

    c+=clamp(plights[i].Il*Ks*factor_especular*fatt,0,1);

	c+=Ke;

  }

  return c;		
}


vec3 shadeDLight()
{
  vec3 c= vec3(0.0);
  c=(dlights[0].Ia)*Ka;

  for (int i=0; i<NUM_DLIGHTS; ++i)
  {  

	vec3 L = normalize(dlights[i].L);
    float factor_difuso = dot(N,L);

    c+=clamp (dlights[i].Il*Kd*factor_difuso,0,1);	

	vec3 R = normalize(reflect(-L,N));
	vec3 V = normalize(vec3(0)-Pp);

	float factor_especular = dot (R,V);
    factor_especular = pow(max (factor_especular,0),n);

    c+=clamp(dlights[i].Il*Ks*factor_especular,0,1);

	c+=Ke;

  }

  return c;		
}


vec3 shadeSLight()
{
  vec3 c= vec3(0.0); 
  c=(slights[0].Ia)*Ka;

  for (int i=0; i<NUM_SLIGHTS; ++i)
  {  

    vec3 L = normalize(slights[i].Pl- Pp);
	vec3 D = normalize(slights[i].D);
	float spot = dot(-L, D);


	if(spot>cos(slights[i].alpha)){
		float d = length (slights[i].Pl - Pp);
		float fatt = 1/(1 + 0 * d + 0.2*d*d);

		float factor_difuso = dot(N,L);

		c+=clamp (slights[i].Il*Kd*factor_difuso*fatt,0,1);	

		vec3 R = normalize(reflect(-L,N));
		vec3 V = normalize(vec3(0)-Pp);

		float factor_especular = dot (R,V);
		factor_especular = pow(max (factor_especular,0),n);

		c+=clamp(slights[i].Il*Ks*factor_especular*fatt,0,1);

		c+=Ke;

	}

  }

  return c;		
}

vec3 shadeFog()
{
  vec3 c= vec3(0.0);

  c=(plights[0].Ia)*Ka;

  for (int i=0; i<1; ++i)
  {  
	float d = length (plights[i].Pl - Pp);
	float fatt = 1/(1 + 0 * d + 0.2*d*d);

	vec3 L = normalize(plights[i].Pl- Pp);
    float factor_difuso = dot(N,L);

    c+=clamp (plights[i].Il*Kd*factor_difuso*fatt,0,1);	

	vec3 R = normalize(reflect(-L,N));
	vec3 V = normalize(vec3(0)-Pp);

	float factor_especular = dot (R,V);
    factor_especular = pow(max (factor_especular,0),n);

    c+=clamp(plights[i].Il*Ks*factor_especular*fatt,0,1);

	c+=Ke;

	float f = clamp(exp(-(pow(fog.df*d,2.0))),0,1);

	c= f*c + (1-f)* fog.cf;

  }

  return c;		
}

void main()
{

	Ka = color;
	Kd = color;

	Pp = vPos;
	N = vNormal;
	N = normalize(N);

	outColor =vec4 (0);
	//outColor += vec4(shadePLight(), 0.0);   
	//outColor += vec4(shadeDLight(), 0.0);   
	//outColor += vec4(shadeSLight(), 0.0);  
	outColor += vec4(shadeFog(), 0.0); 
}
