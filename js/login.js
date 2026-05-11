async function login(){

    const usuario =
    document.getElementById("usuario").value;

    const password =
    document.getElementById("password").value;

    const error =
    document.getElementById("error");

    error.innerText = "";

    try{

        const response = await fetch(
            'https://sebiso-pliegos-oficios-1.onrender.com/api/auth/login',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    usuario,
                    password
                })
            }
        );

        const data = await response.json();

        if(response.ok){

            // GUARDAR TOKEN

            localStorage.setItem(
                'token',
                data.token
            );

            localStorage.setItem(
                'area',
                data.area
            );

            // REDIRECCIÓN

            window.location.href =
            `${data.area}.html`;

        }

        else{

            error.innerText =
            data.error || "Error login";

        }

    }

    catch(err){

        error.innerText =
        "No se pudo conectar al servidor.";

    }

}

function togglePassword(){

    const passwordInput =
    document.getElementById("password");

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

    }else{

        passwordInput.type = "password";

    }

}