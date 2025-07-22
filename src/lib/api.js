/**
 * API de integración con el backend
 * Este archivo contiene funciones para interactuar con el backend
 */

// Importar los módulos necesarios del SDK de Directus
import { createDirectus, rest, readItems, createItem, login, refresh, createUser } from '@directus/sdk';

// Configurar el cliente de Directus
const DIRECTUS_URL = 'https://directus.bryanmedin4.com';
// Configurar el cliente de Directus con REST
const directus = createDirectus(DIRECTUS_URL).with(rest());

// Timeout para operaciones de autenticación (en milisegundos)
const AUTH_TIMEOUT = 10000; // 10 segundos

/**
 * Autentica al usuario con Directus
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Resultado de la autenticación
 */
export async function authenticateUser(email, password) {
  try {
    console.log('Intentando autenticar con Directus:', { email });
    
    // Crear una promesa con timeout para evitar que la operación se quede colgada
    const loginPromise = directus.request(login({ email, password }));
    
    // Establecer un timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado al autenticar')), AUTH_TIMEOUT);
    });
    
    // Usar Promise.race para limitar el tiempo de espera
    const result = await Promise.race([loginPromise, timeoutPromise]);
    
    console.log('Resultado de autenticación:', { 
      success: true, 
      hasUser: !!result.user, 
      hasToken: !!result.access_token,
      hasRefreshToken: !!result.refresh_token,
      expires: result.expires
    });
    
    if (!result || !result.access_token) {
      throw new Error('Respuesta de autenticación inválida');
    }
    
    return {
      success: true,
      data: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires: result.expires
      },
      user: result.user || { email }, // Si no hay user, al menos guardamos el email
      token: result.access_token
    };
  } catch (error) {
    console.error('Error de autenticación:', error);
    return {
      success: false,
      error: error.message || 'Error al autenticar usuario'
    };
  }
}

/**
 * Obtiene los vehículos del usuario autenticado
 * @returns {Promise<Array>} Lista de vehículos del usuario
 */
export async function getVehiculos() {
  try {
    // Verificar si el usuario está autenticado
    // En una implementación real, esto haría una llamada al endpoint
    const items = await directus.request(readItems('Vehiculo'));
    return items || [];
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return [];
  }
}

/**
 * Obtiene las reglas de pico y placa desde el endpoint
 * @returns {Promise<{item1: string[], item2: string[]}>} Objeto con las reglas de pico y placa
 */
export async function getReglasPicoYPlaca() {
  try {
    // En una implementación real, esto haría una llamada al endpoint
    // Intentar obtener las reglas desde el servidor
    try {
      // Aquí iría la llamada real al endpoint cuando esté disponible
      // const response = await directus.request(readItems('PicoYPlacaRules'));
      // if (response && Array.isArray(response) && response.length >= 2) {
      //   return {
      //     item1: response[0].digitos || ['6', '7', '8', '9', '0'],
      //     item2: response[1].digitos || ['1', '2', '3', '4', '5']
      //   };
      // }
    } catch (apiError) {
      console.warn('Error al obtener reglas desde API, usando reglas predefinidas:', apiError);
      // Continuar con las reglas predefinidas
    }
    
    // Simular la respuesta del endpoint o usar como fallback
    const reglas = {
      item1: ['6', '7', '8', '9', '0'],  // ID 1 en el endpoint - Días impares (lunes, miércoles)
      item2: ['1', '2', '3', '4', '5']   // ID 2 en el endpoint - Días pares (martes, jueves)
    };
    
    console.log('Reglas de Pico y Placa obtenidas:', reglas);
    return reglas;
  } catch (error) {
    console.error('Error al obtener reglas de pico y placa:', error);
    // En caso de error, retornamos las reglas por defecto
    return {
      item1: ['6', '7', '8', '9', '0'],
      item2: ['1', '2', '3', '4', '5']
    };
  }
}

/**
 * Cierra la sesión del usuario en Directus
 * @returns {Promise<Object>} Resultado del cierre de sesión
 */
/**
 * Refresca el token de acceso usando el refresh token
 * @param {string} refreshToken - Token de refresco
 * @returns {Promise<Object>} Resultado del refresco de token
 */
export async function refreshToken(refreshToken) {
  try {
    console.log('Intentando refrescar token con Directus');
    
    // Crear una promesa con timeout para evitar que la operación se quede colgada
    const refreshPromise = directus.refresh(refreshToken);
    
    // Establecer un timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado al refrescar token')), AUTH_TIMEOUT);
    });
    
    // Usar Promise.race para limitar el tiempo de espera
    const result = await Promise.race([refreshPromise, timeoutPromise]);
    
    console.log('Token refrescado correctamente');
    
    if (!result || !result.access_token) {
      throw new Error('Respuesta de refresco de token inválida');
    }
    
    return {
      success: true,
      data: result,
      token: result.access_token,
      refreshToken: result.refresh_token,
      expires: result.expires
    };
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return {
      success: false,
      error: error.message || 'Error al refrescar token'
    };
  }
}

export async function logoutUser() {
  try {
    await directus.logout();
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { 
      success: false, 
      error: error.message || 'Error al cerrar sesión'
    };
  }
}

/**
 * Verifica si el usuario está autenticado con Directus
 * @returns {Promise<boolean>} true si está autenticado, false en caso contrario
 */
/**
 * Verifica si el usuario está autenticado con Directus
 * @param {string} refreshToken - Token de refresco (opcional)
 * @returns {Promise<Object>} Resultado de la verificación de autenticación
 */
/**
 * Crea un nuevo vehículo en Directus
 * @param {string} placa - Placa del vehículo
 * @param {string} tipo - Tipo del vehículo
 * @returns {Promise<Object>} Resultado de la creación del vehículo
 */
export async function createVehiculo(placa, tipo) {
  try {
    console.log('Creando vehículo en Directus:', { placa, tipo });
    
    // Obtener el usuario activo del store si estamos en el navegador
    let usuarioId = null;
    if (typeof window !== 'undefined') {
      try {
        // Importar dinámicamente para evitar errores en SSR
        const { useAuthStore } = await import('./auth-store.js');
        const authStore = useAuthStore.getState();
        
        // Intentar obtener el ID del usuario del store
        usuarioId = authStore.user?.id || null;
        console.log('ID de usuario del store:', usuarioId);
        
        // Si no tenemos ID del usuario en el store, intentar obtenerlo desde Directus
        if (!usuarioId && authStore.token) {
          try {
            console.log('Intentando obtener usuario desde Directus');
            // Obtener el usuario actual desde Directus usando el endpoint /users/me
            const userResponse = await directus.request(() => ({
              path: '/users/me',
              method: 'GET',
            }));
            
            if (userResponse && userResponse.id) {
              usuarioId = userResponse.id;
              console.log('ID de usuario obtenido desde Directus:', usuarioId);
            }
          } catch (directusError) {
            console.warn('No se pudo obtener el usuario desde Directus:', directusError);
          }
        }
      } catch (storeError) {
        console.warn('No se pudo obtener el ID del usuario del store:', storeError);
      }
    }
    
    // Crear una promesa con timeout para evitar que la operación se quede colgada
    const createPromise = directus.request(
      createItem('Vehiculo', {
        Placa: placa,
        Tipo: tipo,
        Ciudad: "1", // Asignar automáticamente Ciudad: 1
        Usuario: usuarioId // Asignar el ID del usuario activo si está disponible
      })
    );
    
    // Establecer un timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado al crear vehículo')), AUTH_TIMEOUT);
    });
    
    // Usar Promise.race para limitar el tiempo de espera
    const result = await Promise.race([createPromise, timeoutPromise]);
    
    console.log('Vehículo creado correctamente:', result);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    return {
      success: false,
      error: error.message || 'Error al crear vehículo'
    };
  }
}

/**
 * Crea un nuevo usuario en Directus
 * @param {Object} userData - Datos del usuario a crear
 * @param {string} userData.Nombre - Nombre completo del usuario
 * @param {string} userData.Correo - Correo electrónico del usuario
 * @param {string} userData.Telefono - Teléfono del usuario
 * @param {string} userData.Clave - Contraseña del usuario
 * @param {number} userData.Ciudad - ID de la ciudad del usuario
 * @returns {Promise<Object>} Resultado de la creación del usuario
 */
export async function createUsuario(userData) {
  try {
    console.log('Creando usuario en Directus:', { ...userData, Clave: '***OCULTA***' });
    
    // Crear una promesa con timeout para evitar que la operación se quede colgada
    const createPromise = directus.request(
      createItem('Usuario', {
        Nombre: userData.Nombre,
        Correo: userData.Correo,
        Telefono: userData.Telefono,
        Clave: userData.Clave,
        Ciudad: userData.Ciudad,
        // Campos adicionales que podrían ser necesarios según la configuración de Directus
        status: 'active', // Estado del usuario (active, invited, draft, etc.)
        role: userData.Role || '3' // ID del rol por defecto (3 suele ser el rol de usuario normal)
      })
    );
    
    // Establecer un timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado al crear usuario')), AUTH_TIMEOUT);
    });
    
    // Usar Promise.race para limitar el tiempo de espera
    const result = await Promise.race([createPromise, timeoutPromise]);
    
    console.log('Usuario creado correctamente:', { ...result, Clave: '***OCULTA***' });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    // Manejo específico de errores comunes
    if (error.message && error.message.includes('duplicate') || 
        (error.errors && error.errors.some(e => e.message && e.message.includes('duplicate')))) {
      return {
        success: false,
        error: 'Este correo electrónico ya está registrado. Por favor, utiliza otro.'
      };
    }
    
    if (error.message && error.message.includes('validation')) {
      return {
        success: false,
        error: 'Los datos proporcionados no son válidos. Por favor, verifica la información.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Error al crear usuario'
    };
  }
}

/**
 * Crea un nuevo usuario utilizando el SDK de Directus
 * @param {Object} userData - Datos del usuario a crear
 * @param {string} userData.email - Correo electrónico del usuario (requerido)
 * @param {string} userData.password - Contraseña del usuario (requerido)
 * @param {string} userData.first_name - Nombre del usuario
 * @returns {Promise<Object>} Resultado de la creación del usuario
 */
export async function createDirectusUser(userData) {
  try {
    console.log('Creando usuario con SDK de Directus:', { 
      ...userData, 
      password: '***OCULTA***' 
    });
    
    // Validar campos requeridos
    if (!userData.email || !userData.password) {
      throw new Error('El email y la contraseña son obligatorios');
    }
    
    // Preparar datos para la API de Directus - solo los campos necesarios
    const userPayload = {
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name || '',
      role: "4bf867c2-ea16-4c47-a042-efe0b39ecce9" // Asignar el rol específico
    };
    
    // Crear una promesa con timeout para evitar que la operación se quede colgada
    const requestPromise = directus.request(createUser(userPayload));
    
    // Establecer un timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado al crear usuario')), AUTH_TIMEOUT);
    });
    
    // Usar Promise.race para limitar el tiempo de espera
    const result = await Promise.race([requestPromise, timeoutPromise]);
    
    console.log('Usuario creado correctamente con SDK de Directus:', { 
       ...result, 
       password: '***OCULTA***' 
     });
     
     // Devolver un objeto estructurado con success: true y los datos del usuario
     return {
       success: true,
       data: result,
       message: 'Usuario creado exitosamente'
     };
   } catch (error) {
     console.error('Error al crear usuario con SDK de Directus:', error);
     
     // Manejar errores específicos
     // Verificar si el error tiene la estructura esperada del SDK de Directus
     let errorMessage = 'Error desconocido al crear usuario';
     
     if (error && error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
       errorMessage = error.errors[0].message || 'Error desconocido';
       
       if (errorMessage.includes('Duplicate entry') || errorMessage.includes('already exists') || errorMessage.includes('has to be unique')) {
         errorMessage = 'El correo electrónico ya está registrado';
       } else if (errorMessage.includes('validation') || errorMessage.includes('Validation')) {
         errorMessage = 'Error de validación: ' + errorMessage;
       } else if (errorMessage.includes('permission') || errorMessage.includes('Permission') || 
                    errorMessage.includes('FORBIDDEN')) {
         errorMessage = 'No tienes permisos para crear usuarios';
       }
     } else if (error.message) {
       errorMessage = error.message;
       
       if (error.message.includes('Tiempo de espera agotado')) {
         errorMessage = 'Tiempo de espera agotado al crear el usuario. Inténtalo de nuevo.';
       }
     }
     
     // Devolver un objeto estructurado con success: false y el mensaje de error
     return {
       success: false,
       error: errorMessage
     };
  }
}
    


export async function isAuthenticated(refreshToken = null) {
  try {
    console.log('Verificando autenticación con Directus');
    
    // Crear una promesa con timeout para evitar que la operación se quede colgada
    const authCheckPromise = directus.request(readItems('Vehiculo', { limit: 1 }));
    
    // Establecer un timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), AUTH_TIMEOUT);
    });
    
    // Usar Promise.race para limitar el tiempo de espera
    await Promise.race([authCheckPromise, timeoutPromise]);
    console.log('Usuario autenticado correctamente');
    return { isAuthenticated: true, tokenRefreshed: false };
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    
    // Verificar si el error es por token expirado o inválido
    if (error && (error.message?.includes('token') || error.message?.includes('auth') || error.status === 401 || error.status === 403)) {
      console.log('Error de autenticación detectado, token posiblemente expirado');
      
      // Si tenemos un refresh token, intentar refrescar el token
      if (refreshToken) {
        console.log('Intentando refrescar token automáticamente');
        try {
          // Usar el método refresh del SDK de Directus
          const refreshResult = await directus.refresh(refreshToken);
          if (refreshResult && refreshResult.access_token) {
            console.log('Token refrescado automáticamente con éxito');
            return { 
              isAuthenticated: true, 
              tokenRefreshed: true,
              newToken: refreshResult.access_token,
              newRefreshToken: refreshResult.refresh_token,
              expires: refreshResult.expires
            };
          }
        } catch (refreshError) {
          console.error('Error al refrescar token automáticamente:', refreshError);
        }
      }
      
      return { isAuthenticated: false, tokenRefreshed: false };
    }
    
    // Para otros tipos de errores (como problemas de red), no consideramos que la autenticación haya fallado
    // Solo que no pudimos verificarla
    console.log('Error de conexión o servidor, no se pudo verificar la autenticación');
    return { isAuthenticated: null, tokenRefreshed: false }; // Retornamos null para indicar que no pudimos verificar
  }
}

/**
 * Obtiene todos los usuarios registrados
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function getUsers() {
  try {
    // Obtener todos los usuarios desde Directus
    const users = await directus.request(readItems('directus_users', {
      fields: ['id', 'first_name', 'email']
    }));
    
    // Mapear los campos de Directus a los nombres de campo utilizados en la aplicación
    return users.map(user => ({
      id: user.id,
      Nombre: user.first_name || 'Sin nombre',
      Correo: user.email
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

/**
 * Obtiene un usuario específico por su ID
 * @param {string} id - ID del usuario a obtener
 * @returns {Promise<Object>} Datos del usuario
 */
export async function getUser(id) {
  try {
    // Obtener un usuario específico desde Directus
    const user = await directus.request(readItems('directus_users', {
      fields: ['id', 'first_name', 'email', 'phone'],
      filter: { id: { _eq: id } }
    }));
    
    if (!user || user.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    // Mapear los campos de Directus a los nombres de campo utilizados en la aplicación
    return {
      id: user[0].id,
      Nombre: user[0].first_name || 'Sin nombre',
      Correo: user[0].email,
      Telefono: user[0].phone || 'No disponible'
    };
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${id}:`, error);
    // Devolver un objeto con valores por defecto en caso de error
    return {
      id: id,
      Nombre: 'Error al cargar',
      Correo: 'No disponible',
      Telefono: 'No disponible'
    };
  }
}

/**
 * Obtiene un vehículo específico por su ID
 * @param {string} id - ID del vehículo a obtener
 * @returns {Promise<Object>} Datos del vehículo
 */
export async function getVehiculoById(id) {
  try {
    console.log('Obteniendo vehículo con ID:', id);
    
    // Obtener un vehículo específico desde Directus
    // Solo solicitamos campos a los que sabemos que tenemos acceso
    const vehiculo = await directus.request(readItems('Vehiculo', {
      fields: ['id', 'Placa', 'Tipo', 'Usuario'],
      filter: { id: { _eq: id } }
    }));
    
    if (!vehiculo || vehiculo.length === 0) {
      throw new Error('Vehículo no encontrado');
    }
    
    console.log('Vehículo obtenido:', vehiculo[0]);
    return vehiculo[0];
  } catch (error) {
    console.error(`Error al obtener vehículo con ID ${id}:`, error);
    // Devolver null en caso de error
    return null;
  }
}