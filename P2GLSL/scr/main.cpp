#include "BOX.h"
#include <IGL/IGlib.h>

#define GLM_FORCE_RADIANS
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>


//variables auxiliares
static glm::vec3 mouseButtons = glm::vec3(false);
static glm::vec2 mousePosition = glm::vec2(0, 0);

float near = 0.1f;
float far = 100.0f;


//Variables requeridas
glm::mat4 viewMat = glm::mat4(1.0f);


//Idenficadores de los objetos de la escena
int objId = -1;


//Declaración de CB
void resizeFunc(int width, int height);
void idleFunc();
void keyboardFunc(unsigned char key, int x, int y);
void mouseFunc(int button, int state, int x, int y);
void mouseMotionFunc(int x, int y);

void orbitalCamera(int dx, int dy);
void firstPersonCamera(int dx, int dy);

void setViewMat(glm::mat4 view);
glm::mat4 getViewMat();
void setCameraPosition(glm::vec3 cameraPosition);
glm::vec3 getCameraPosition();
glm::vec3 getCameraRight();
glm::vec3 getCameraUp();
glm::vec3 getCameraBack();


int main(int argc, char** argv)
{
	std::locale::global(std::locale("spanish"));// acentos ;)
	if (!IGlib::init("../shaders_P2/shader.v2.vert", "../shaders_P2/shader.v2.frag"))
		return -1;
   
	//Declaracion de CBs
	IGlib::setIdleCB(idleFunc);
	IGlib::setResizeCB(resizeFunc);
	IGlib::setKeyboardCB(keyboardFunc);
	IGlib::setMouseCB(mouseFunc);
	IGlib::setMouseMoveCB(mouseMotionFunc);

	//Se ajusta la cámara
	//Si no se da valor se cojen valores por defecto
	glm::vec3 cameraPosition = glm::vec3(0.0f, 0.0f, 8.0f);
	glm::vec3 cameraTarget = glm::vec3(0.0f, 0.0f, 0.0f);
	glm::vec3 cameraBack = glm::normalize(cameraPosition - cameraTarget);//coordenadas view
	glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f); //coordenadas world
	glm::vec3 cameraRight = glm::normalize(glm::cross(up, cameraBack)); //coordenadas view
	glm::vec3 cameraUp = glm::cross(cameraBack, cameraRight); //coordenadas view
	glm::mat4 view = glm::lookAt(cameraPosition, cameraTarget, cameraUp);
	setViewMat(view);

	glm::mat4 proj = glm::mat4(1.0f);
	float f = 1.0f / tan(3.141592f / 6.0f);

	proj[0].x = f;
	proj[1].y = f;
	proj[2].z = (far + near) / (near - far);
	proj[2].w = -1.0f;
	proj[3].z = (2.0f * far * near) / (near - far);
	proj[3].w = 0.0f;

	IGlib::setProjMat(proj);
	IGlib::setViewMat(view);
	viewMat = view;

	//Creamos el objeto que vamos a visualizar
	objId = IGlib::createObj(cubeNTriangleIndex, cubeNVertex, cubeTriangleIndex, 
			cubeVertexPos, cubeVertexColor, cubeVertexNormal,cubeVertexTexCoord, cubeVertexTangent);
	IGlib::addColorTex(objId, "../img/color.png");
	glm::mat4 modelMat = glm::mat4(1.0f);
	IGlib::setModelMat(objId, modelMat);
	
	//Mainloop
	IGlib::mainLoop();
	IGlib::destroy();
	return 0;
}

//=======FUNCIONES AUXILIARES=======//

void setViewMat(glm::mat4 view)
{
	viewMat = view;
	IGlib::setViewMat(viewMat);
}

glm::mat4 getViewMat()
{
	return viewMat;
}

void setCameraPosition(glm::vec3 cameraPosition)
{
	viewMat[3].x = cameraPosition.x;
	viewMat[3].y = cameraPosition.y;
	viewMat[3].z = cameraPosition.z;
	IGlib::setViewMat(viewMat);
}

glm::vec3 getCameraPosition()
{
	return glm::vec3(viewMat[3].x, viewMat[3].y, viewMat[3].z);
}

glm::vec3 getCameraRight()
{
	return glm::vec3(viewMat[0].x, viewMat[1].x, viewMat[2].x);
}

glm::vec3 getCameraUp()
{
	return glm::vec3(viewMat[0].y, viewMat[1].y, viewMat[2].y);
}

glm::vec3 getCameraBack()
{
	return glm::vec3(viewMat[0].z, viewMat[1].z, viewMat[2].z);
}

//==================================//



void resizeFunc(int width, int height)
{
	//Ajusta el aspect ratio al tamaño de la venta
	glm::mat4 proj = glm::mat4(0.0f);
	float aspectRat;
	float temp = tan((3.141592f * 30.0f) / 180.0f);

	aspectRat = (float)width / (float)height;

	proj[0].x = 1 / (aspectRat * temp);
	proj[1].y = 1 / temp;
	proj[2].z = -(far + near) / (far - near);
	proj[2].w = -1.0f;
	proj[3].z = -2.0f * far * near / (far - near);
	proj[3].w = 0.0f;

	IGlib::setProjMat(proj);
}

void idleFunc()
{
	glm::mat4 modelMat(1.0f);
	static float angle = 0.0f;
	angle = (angle > 3.141592f * 2.0f) ? 0 : angle + 0.001f;
	
	modelMat = glm::rotate(modelMat, angle, glm::vec3(1.0f, 1.0f, 0.0f));

	IGlib::setModelMat(objId, modelMat);
}

void keyboardFunc(unsigned char key, int x, int y)
{
	float amount = 0.6f;

	glm::vec3 translationVec = glm::vec3(0.0f);

	switch (key)
	{
	case 'w':
		translationVec = getCameraBack();
		break;
	case 's':
		translationVec = -getCameraBack();
		break;
	case 'a':
		translationVec = getCameraRight();
		break;
	case 'd':
		translationVec = -getCameraRight();
		break;
	}

	glm::mat4 view = glm::translate(getViewMat(), translationVec * amount);
	setViewMat(view);
	std::cout << "Se ha pulsado la tecla " << key << std::endl << std::endl;
}

void mouseFunc(int button, int state, int x, int y)
{
	if (state == 0)
	{
		std::cout << "Se ha pulsado el botón ";
	}
	else
	{
		mouseButtons = glm::vec3(false, false, false);
		std::cout << "Se ha soltado el botón ";
	}

	if (button == 0)
	{
		mouseButtons = glm::vec3(true, false, false);
		mousePosition.x = x;
		mousePosition.y = y;
		std::cout << "de la izquierda del ratón " << std::endl;
	}

	if (button == 1)
	{
		mouseButtons = glm::vec3(false, true, false);
		mousePosition.x = x;
		mousePosition.y = y;
		std::cout << "central del ratón " << std::endl;
	}

	if (button == 2)
	{
		mouseButtons = glm::vec3(false, false, true);
		mousePosition.x = x;
		mousePosition.y = y;
		std::cout << "de la derecha del ratón " << std::endl;
	}

	std::cout << "en la posición " << x << " " << y << std::endl << std::endl;
}

void mouseMotionFunc(int x, int y)
{
	if (mouseButtons == glm::vec3(false, false, false))
		return;

	std::cout << "Se mueve el raton en la posición " << x << " " << y << std::endl << std::endl;

	int dx = x - mousePosition.x;
	int dy = y - mousePosition.y;

	if (mouseButtons[0] == true)
	{
		orbitalCamera(dx, dy);
	}
	else if (mouseButtons[2] == true)
	{
		firstPersonCamera(dx, dy);
	}

	mousePosition.x = x;
	mousePosition.y = y;
}

void orbitalCamera(int dx, int dy)
{
	std::cout << "Orbital camera" << std::endl;

	float rotation = 0.4f;
	float angleX = glm::radians(dx * rotation);
	float angleY = glm::radians(dy * rotation);

	glm::mat4 view = glm::rotate(getViewMat(), angleX, getCameraUp());
	view = glm::rotate(view, angleY, getCameraRight());

	setViewMat(view);
}

void firstPersonCamera(int dx, int dy)
{
	std::cout << "First person shooter camera" << std::endl;

	float rotation = 0.2f;
	float angleX = glm::radians(dx * rotation);
	float angleY = glm::radians(dy * rotation);

	glm::mat4 matPitch = glm::rotate(glm::mat4(1.0f), angleY, glm::vec3(1.0f, 0.0f, 0.0f));
	glm::mat4 matYaw = glm::rotate(glm::mat4(1.0f), angleX, glm::vec3(0.0f, 1.0f, 0.0f));

	glm::mat4 rotationMat = matPitch * matYaw;
	glm::mat4 view = rotationMat * getViewMat();

	setViewMat(view);
}
