
import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: '2cc89bfe-6192-40e2-80a8-fd218121c623',
    authority: 'https://login.microsoftonline.com/08271f42-81ef-45d6-81ac-49776c4be615',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

// ✨ TODOS LOS PERMISOS CONFIGURADOS EN AZURE ENTRA DIRECTORY
// Se incluyen todos los 50 permisos de Microsoft Graph que tienes configurados
export const loginRequest: PopupRequest = {
  scopes: [
    // 📅 PERMISOS DE CALENDARIO
    'Calendars.Read',                    // Leer calendarios del usuario
    'Calendars.Read.Shared',             // Leer calendarios compartidos
    'Calendars.ReadBasic',               // Leer información básica de calendarios
    'Calendars.ReadWrite',               // Leer y escribir calendarios del usuario
    'Calendars.ReadWrite.Shared',        // Leer y escribir calendarios compartidos
    
    // 💬 PERMISOS DE CHAT Y MENSAJES
    'Chat.Create',                       // Crear chats
    'Chat.Read',                         // Leer chats
    'Chat.ReadBasic',                    // Leer información básica de chats
    'Chat.ReadWrite',                    // Leer y escribir chats
    'ChatMessage.Read',                  // Leer mensajes de chat
    'ChatMessage.Send',                  // Enviar mensajes de chat
    
    // 👥 PERMISOS DE CONTACTOS
    'Contacts.Read',                     // Leer contactos del usuario
    'Contacts.Read.Shared',              // Leer contactos compartidos
    'Contacts.ReadWrite',                // Leer y escribir contactos del usuario
    'Contacts.ReadWrite.Shared',         // Leer y escribir contactos compartidos
    
    // 📁 PERMISOS DE ARCHIVOS
    'Files.Read',                        // Leer archivos del usuario
    'Files.Read.All',                    // Leer todos los archivos
    'Files.Read.Selected',               // Leer archivos seleccionados
    'Files.ReadWrite',                   // Leer y escribir archivos del usuario
    'Files.ReadWrite.All',               // Leer y escribir todos los archivos
    'Files.ReadWrite.AppFolder',         // Leer y escribir en carpeta de la aplicación
    'Files.ReadWrite.Selected',          // Leer y escribir archivos seleccionados
    
    // 📧 PERMISOS DE CORREO ELECTRÓNICO
    'Mail.Read',                         // Leer correos del usuario
    'Mail.Read.Shared',                  // Leer correos compartidos
    'Mail.ReadBasic',                    // Leer información básica de correos
    'Mail.ReadBasic.Shared',             // Leer información básica de correos compartidos
    'Mail.ReadWrite',                    // Leer y escribir correos del usuario
    'Mail.ReadWrite.Shared',             // Leer y escribir correos compartidos
    'Mail.Send',                         // Enviar correos como el usuario
    'Mail.Send.Shared',                  // Enviar correos desde buzones compartidos
    
    // 📂 PERMISOS DE CARPETAS DE CORREO
    'MailboxFolder.Read',                // Leer carpetas del buzón
    'MailboxFolder.ReadWrite',           // Leer y escribir carpetas del buzón
    'MailboxItem.Read',                  // Leer elementos del buzón
    
    // ⚙️ PERMISOS DE CONFIGURACIÓN DE BUZÓN
    'MailboxSettings.Read',              // Leer configuración del buzón
    'MailboxSettings.ReadWrite',         // Leer y escribir configuración del buzón
    
    // 🔔 PERMISOS DE NOTIFICACIONES
    'Notifications.ReadWrite.CreatedByApp',     // Gestionar notificaciones creadas por la app
    'UserNotification.ReadWrite.CreatedByApp',  // Gestionar notificaciones de usuario creadas por la app
    
    // 👤 PERMISOS DE USUARIO Y PERFIL
    'User.Read',                         // Leer perfil del usuario
    'User.ReadBasic.All',                // Leer información básica de todos los usuarios
    'User.ReadWrite',                    // Leer y escribir perfil del usuario
    'People.Read',                       // Leer información de personas relevantes
    
    // 📝 PERMISOS DE NOTAS Y TAREAS
    'ShortNotes.Read',                   // Leer notas cortas
    'ShortNotes.ReadWrite',              // Leer y escribir notas cortas
    'Tasks.Read',                        // Leer tareas del usuario
    'Tasks.Read.Shared',                 // Leer tareas compartidas
    'Tasks.ReadWrite',                   // Leer y escribir tareas del usuario
    'Tasks.ReadWrite.Shared',            // Leer y escribir tareas compartidas
    
    // 🔐 PERMISOS BÁSICOS DE AUTENTICACIÓN (REQUERIDOS)
    'openid',                            // Identificación OpenID (requerido para autenticación)
    'profile',                           // Acceso al perfil básico (requerido)
    'email',                             // Acceso al email del usuario (requerido)
  ],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphPhotoEndpoint: 'https://graph.microsoft.com/v1.0/me/photo/$value',
};
