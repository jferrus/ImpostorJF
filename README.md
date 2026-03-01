# ImpostorJF 🕵️‍♂️

¡Bienvenido a **ImpostorJF**! Un emocionante juego de adivinanzas y engaño basado en Expo (React Native). Reúne a tus amigos (mínimo 3) y descubre quién es el impostor antes de que sea demasiado tarde.

## 📝 Descripción del Proyecto

ImpostorJF es un juego social de dispositivos móviles inspirado en el clásico juego "Spyfall" o similares. En cada ronda:
1. Todos los jugadores reciben una **palabra secreta** perteneciente a una categoría específica.
2. Un jugador aleatorio es designado como el **Impostor** y recibe una **pista vaga** en lugar de la palabra secreta.
3. Los jugadores deben debatir y hacerse preguntas para identificar al impostor, mientras que el impostor intenta pasar desapercibido.

## 🚀 Cómo Ejecutar/Compilar localmente

Este proyecto utiliza **Expo**. Sigue estos pasos para configurarlo en tu entorno local:

### Requisitos previos
- Node.js instalado.
- Expo CLI instalado (`npm install -g expo-cli`).

### Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/jferrus/ImpostorJF.git
   cd ImpostorJF
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Ejecución
- Para iniciar el servidor de desarrollo de Expo:
  ```bash
  npm run start
  ```
- Para probar en Android/iOS/Web usa los comandos correspondientes:
  ```bash
  npm run android
  npm run ios
  npm run web
  ```

## 🏗️ Cómo Compilar (Build)

Usamos **EAS (Expo Application Services)** para generar los binarios:

- **Para crear una pre-release (APK para Android):**
  ```bash
  eas build --profile preview --platform android
  ```
- **Para producción:**
  ```bash
  eas build --profile production --platform android
  ```

## 📥 Descargar Pre-release

Puedes descargar las versiones preliminares directamente desde la sección de **Releases** de nuestro repositorio en GitHub:

👉 [Descargar Pre-release (APK)](https://github.com/jferrus/ImpostorJF/releases)

---
*Desarrollado con ❤️ para jugar entre amigos.*
