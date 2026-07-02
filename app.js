// =========================================
// Konfiguration
// =========================================

const maxDistance = 1500;

// =========================================
// Schulungszentren
// =========================================

const locations = [

    {
        name: "Heilbronn",
        lat: 49.1607,
        lon: 9.1897
    },

    {
        name: "Nürnberg",
        lat: 49.4460,
        lon: 11.0415
    },

    {
        name: "Stuttgart",
        lat: 48.6948,
        lon: 9.1478
    },

    {
        name: "Karlsruhe",
        lat: 49.0307,
        lon: 8.3835
    }

];

// =========================================
// Haversine Formel
// =========================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *

        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}

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
// Standort abrufen
// =========================================

function getLocation() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

        }
    );
}

// =========================================
// Standort prüfen
// =========================================

function checkSchoolLocation(
    userLat,
    userLon
) {

    let nearestLocation = null;
    let nearestDistance = Infinity;

    for (
        const location of locations
    ) {

        const distance =
            calculateDistance(
                userLat,
                userLon,
                location.lat,
                location.lon
            );

        if (
            distance <
            nearestDistance
        ) {

            nearestDistance =
                distance;

            nearestLocation =
                location;
        }

        if (
            distance <=
            maxDistance
        ) {

            return {

                valid: true,

                locationName:
                    location.name,

                distance:
                    Math.round(
                        distance
                    )

            };
        }
    }

    return {

        valid: false,

        nearestLocation:
            nearestLocation.name,

        nearestDistance:
            Math.round(
                nearestDistance
            )

    };
}

// =========================================
// Daten speichern
// =========================================

async function saveCheckIn(
    latitude,
    longitude,
    locationName
) {

    const now = new Date();

    const userName =
        document.getElementById(
            "userName"
        ).value;

    const userEmail =
        document.getElementById(
            "userEmail"
        ).value;

    if (
        !userName ||
        !userEmail
    ) {

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
            locationName,

        CheckDate:
            now.toISOString(),

        CheckTime:
            now.toLocaleTimeString(
                "de-DE"
            ),

        Latitude:
            latitude,

        Longitude:
            longitude

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

    try {

        showMessage(
            "Standort wird geprüft...",
            "info"
        );

        const position =
            await getLocation();

        const latitude =
            position.coords.latitude;

        const longitude =
            position.coords.longitude;

        const result =
            checkSchoolLocation(
                latitude,
                longitude
            );

        if (
            !result.valid
        ) {

            showMessage(

                "Kein gültiger Standort.<br>" +

                "Nächstes Schulungszentrum: " +
                result.nearestLocation +

                "<br>Entfernung: " +
                result.nearestDistance +
                " Meter<br>" +

                "Erlaubter Radius: " +
                maxDistance +
                " Meter",

                "danger"
            );

            return;
        }

        showMessage(

            "Standort erkannt: " +
            result.locationName +

            "<br>Entfernung: " +
            result.distance +
            " Meter",

            "success"
        );

        await saveCheckIn(

            latitude,

            longitude,

            result.locationName
        );

    } catch (
        error
    ) {

        console.error(
            error
        );

        showMessage(

            "Standort konnte nicht ermittelt werden.<br>" +
            error.message,

            "danger"
        );
    }
}
