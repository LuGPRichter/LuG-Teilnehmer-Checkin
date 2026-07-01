// =========================================
// Konfiguration
// =========================================

const maxDistance = 500;

// Schulungszentren

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
        lat: 48.6964407,
        lon: 9.162761
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
        Math.PI /
        180;

    const dLon =
        (lon2 - lon1) *
        Math.PI /
        180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *
        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

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
// Meldungen anzeigen
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
        `
        <div class="alert alert-${type}">
            ${text}
        </div>
        `;
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
// Schulungszentrum prüfen
// =========================================

function checkSchoolLocation(
    userLat,
    userLon
) {

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
        valid: false
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

    const now =
        new Date();

    const data = {

        UserName:
            "Patrick Richter",

        UserEmail:
            "patrick@test.de",

        Standort:
            locationName,

        CheckDate:
            now.toLocaleDateString(
                
            ),

        CheckTime:
            now.toLocaleTimeString(
                "de-DE"
            ),

        Latitude:
            latitude,

        Longitude:
            longitude

    };

    try {

        const response =
            await fetch(

                "https://default89bb60786f5646f6936d0ee5563b6a.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/19dfe4fbfe654bb78bd85dee97d84f22/triggers/manual/paths/invoke?api-version=1",

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

            showMessage(
                "Check-In erfolgreich gespeichert.",
                "success"
            );

        } else {

            showMessage(
                "Fehler beim Speichern der Daten.",
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
            "Verbindung zu Power Automate fehlgeschlagen.",
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
                "Du befindest dich nicht an einem freigegebenen Schulungszentrum. Check-In nur innerhalb von 50 Metern möglich.",
                "danger"
            );

            return;
        }

        showMessage(
            "Standort erkannt: " +
            result.locationName +
            " (" +
            result.distance +
            " Meter Entfernung)",
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
            "Standort konnte nicht ermittelt werden. Bitte Standortfreigabe aktivieren.",
            "danger"
        );
    }
}
