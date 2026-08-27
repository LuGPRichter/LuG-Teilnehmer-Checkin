// =========================================
// Schulungszentren mit WAN-IP-Adressen
// =========================================

const allowedIPs = {
    "Heilbronn": [
        "80.187.66.205",
        "109.90.55.6",
    ],

    "Nürnberg": [
        "24.134.89.241"
    ],

    "Stuttgart": [
    "217.7.193.54",
    "83.135.163.*",
    "87.147.22.105"

    ],    
        
    "Karlsruhe": [
        "78.94.141.170"
    ],
};

// =========================================
// Meldungen
// =========================================

function showMessage(
    text,
    type
) {

    document
        .getElementById(
            "meldung"
        )
        .innerHTML =

        `<div class="alert alert-${type}">
            ${text}
        </div>`;
}

// =========================================
// Öffentliche IP abrufen
// =========================================

async function getPublicIP() {

    const response =
        await fetch(
            "https://api.ipify.org?format=json"
        );

    const data =
        await response.json();

    return data.ip;
}

// =========================================
// IP-Adresse prüfen
// =========================================

function checkIPAddress(ip) {

    for (const [locationName, ipList] of Object.entries(allowedIPs)) {

        for (const allowedIP of ipList) {

            // Exakte IP prüfen
            if (allowedIP === ip) {

                return {
                    valid: true,
                    locationName: locationName
                };
            }

            // Bereiche prüfen (z.B. 83.135.163.*)
            if (allowedIP.endsWith("*")) {

                const prefix =
                    allowedIP.slice(0, -1);

                if (ip.startsWith(prefix)) {

                    return {
                        valid: true,
                        locationName: locationName
                    };
                }
            }
        }
    }

    return {
        valid: false
    };
}

// =========================================
// Daten speichern
// =========================================

async function saveCheckIn(
    ipAddress,
    locationName
) {

    const now =
        new Date();
    const userName =
    document.getElementById(
        "usernameInput"
    ).value.trim();

const email =
    document.getElementById(
        "email"
    ).value.trim() +
    "@training.lug-ag.de";

    const data = {

        UserName:
            userName,

        UserEmail:
            email,

        Standort:
            locationName,

        IPAdresse:
            ipAddress,

        CheckDate:
            now.toISOString(),

        CheckTime:
            now.toLocaleTimeString(
                "de-DE"
            )

    };

    try {

        const response =
            await fetch(

                "https://default89bb60786f5646f6936d0ee5563b6a.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/15/workflows/19dfe4fbfe654bb78bd85dee97d84f22/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qOSzG_4wCK88dnmvywfOsAGlB6FikDdak1FkeFyJ6yY",

                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );

        if (
            response.ok
        ) {

            const result =
                await response.text();

            console.log(
                "Power Automate Antwort:",
                result
            );

            showMessage(
                "Check-In erfolgreich gespeichert.",
                "success"
            );

        } else {

            const errorText =
                await response.text();

            console.error(
                errorText
            );

            showMessage(
                "Fehler beim Speichern:<br>" +
                errorText,
                "danger"
            );
        }

    } catch (
        error
    ) {

        console.error(
            error
        );

        showMessage(
            "Verbindung zu Power Automate fehlgeschlagen:<br>" +
            error.message,
            "danger"
        );
    }
}

// =========================================
// Hauptfunktion
// =========================================

async function checkIn() {

    const agb =
        document.getElementById(
            "agb"
        );
    const userName =
    document.getElementById(
        "usernameInput"
    ).value.trim();

if (!userName) {

    showMessage(
        "Bitte Vor- und Nachnamen eingeben.",
        "warning"
    );

    return;
}
const emailInput =
    document.getElementById(
        "email"
    ).value.trim();

if (!emailInput) {

    showMessage(
        "Bitte E-Mail-Adresse eingeben.",
        "warning"
    );

    return;
}

const email =
    emailInput +
    "@training.lug-ag.de";


if (!email) {

    showMessage(
        "Bitte E-Mail-Adresse eingeben.",
        "warning"
    );

    return;
}

    if (
        !agb.checked
    ) {

        showMessage(
            "Bitte die Nutzungsbedingungen akzeptieren.",
            "warning"
        );

        return;
    }

    try {

        showMessage(
            "Standort wird geprüft...",
            "info"
        );

        const ip =
            await getPublicIP();

        console.log(
            "Öffentliche IP:",
            ip
        );

        const result =
            checkIPAddress(
                ip
            );

        if (
            !result.valid
        ) {

            showMessage(

                "Check-In nicht möglich.<br>" +
                "Sie befinden sich nicht in einem zugelassenen Schulungszentrum.<br><br>" +
                "Ermittelte IP-Adresse: " +
                ip,

                "danger"
            );

            return;
        }

        showMessage(

            "Standort erkannt: " +
            result.locationName +
            "<br>IP-Adresse: " +
            ip,

            "success"
        );

        await saveCheckIn(
            ip,
            result.locationName
        );

    } catch (
        error
    ) {

        console.error(
            error
        );

        showMessage(

            "IP-Adresse konnte nicht ermittelt werden.<br>" +
            error.message,

            "danger"
        );
    }
}
