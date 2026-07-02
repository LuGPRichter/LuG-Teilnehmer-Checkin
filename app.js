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
// Daten speichern
// =========================================

async function saveCheckIn() {

    const now = new Date();

    const userName =
        document.getElementById(
            "userName"
        ).value;

    const userEmail =
        document.getElementById(
            "userEmail"
        ).value;

    if (!userName || !userEmail) {

        showMessage(
            "Bitte Name und E-Mail eingeben.",
            "warning"
        );

        return;
    }

    const data = {

        UserName:
            userName,

        UserEmail:
            userEmail,

        Standort:
            "Nürnberg",

        CheckDate:
            now.toISOString(),

        CheckTime:
            now.toLocaleTimeString(
                "de-DE"
            ),

        Latitude:
            49.4460,

        Longitude:
            11.0415

    };

    console.log(
        "Sende Daten:",
        data
    );

    try {

        const response =
            await fetch(

                "https://default89bb60786f5646f6936d0ee5563b6a.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/19dfe4fbfe654bb78bd85dee97d84f22/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qOSzG_4wCK88dnmvywfOsAGlB6FikDdak1FkeFyJ6yY",

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

    if (
        !agb.checked
    ) {

        showMessage(
            "Bitte die Nutzungsbedingungen akzeptieren.",
            "warning"
        );

        return;
    }

    await saveCheckIn();

}
