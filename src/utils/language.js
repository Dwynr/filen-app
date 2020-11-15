let translations = {}

translations['en'] = {}
translations['nl'] = {}
translations['de'] = {}

translations['fr']['close'] = "Fermer"
translations['fr']['cancel'] = "Annuler"
translations['fr']['refresh'] = "Rafraîchir"
translations['fr']['trashItem'] = "Poubelle"
translations['fr']['moveItem'] = "Déplacer"
translations['fr']['myCloud'] = "Mon Stockage"
translations['fr']['loginTitle'] = "Se connecter"
translations['fr']['registerTitle'] = "Créer un compte"
translations['fr']['or'] = "ou"
translations['fr']['loginButton'] = "Me connecter"
translations['fr']['registerButton'] = "Crée mon compte"
translations['fr']['registerLink'] = "Créer un compte (Les 10 premiers Go gratuits)"
translations['fr']['loginLink'] = "Me connecter"
translations['fr']['passwordRepeatPlaceholder'] = "Répéter votre mot de passe"
translations['fr']['emailPlaceholder'] = "Courriel"
translations['fr']['passwordPlaceholder'] = "Mot de passe"
translations['fr']['2faPlaceholder'] = "Code d'Authentification (laisser vide si désactivé)"
translations['fr']['loginInvalidInputs'] = "Courriel et mot de passe invalide"
translations['fr']['alertOkButton'] = "OK"
translations['fr']['loginWrongCredentials'] = "Courriel, mot de passe ou code d'authentification incorrect"
translations['fr']['apiRequestError'] = "Erreur de requête, svp réessayer plus tard"
translations['fr']['registerInvalidFields'] = "Champs invalides"
translations['fr']['registerPasswordAtLeast10Chars'] = "Votre mot de passe doit être au moins 10 lettres de longeur."
translations['fr']['registerPasswordsDoNotMatch'] = "Les mot de passes ne correspondent pas"
translations['fr']['registerInvalidEmail'] = "Courriel invalide"
translations['fr']['registerEmailAlreadyRegistered'] = "Ce courriel est déjà enregistré"
translations['fr']['registerCouldNotSendEmail'] = "OK"
translations['fr']['alertOkButton'] = "Nous ne pouvons pas envoyer un message à ce moment, svp réessayer plus tard"
translations['fr']['registerSuccess'] = "Compte enregistré, svp confirmer votre courriel en cliquant sur le lien que nous vous avons envoyé"
translations['fr']['registerInvalidInputs'] = "Courriel invalide, mot de passe et confirmez votre mot de passe"
translations['fr']['sharedWithMe'] = "Partagé avec moi"
translations['fr']['currentlySharing'] = "Partageant actuellement"
translations['fr']['settings'] = "Paramètres"
translations['fr']['encryption'] = "Chiffrement"
translations['fr']['help'] = "Aide"
translations['fr']['trash'] = "Poubelle"
translations['fr']['userStorageUsageMenuText'] = "__PERCENTAGE__% de __MAX__ utilisé"
translations['fr']['goProBadge'] = "Devenir Pro"
translations['fr']['unknownDeviceError'] = "Une erreur inconnu a eu lieu sur votre appareil, essayer de redémarrer l'appli ou contacter notre équipe de soutien pour l'aide"
translations['fr']['alertOkButton'] = "OK"
translations['fr']['alertOkButton'] = "OK"
translations['fr']['alertOkButton'] = "OK"
translations['fr']['alertOkButton'] = "OK"
translations['fr']['alertOkButton'] = "OK"
translations['fr']['alertOkButton'] = "OK"

translations['nl']['close'] = "Sluit"
translations['nl']['cancel'] = "Annuleer"
translations['nl']['refresh'] = "Ververs"
translations['nl']['trashItem'] = "Prullenbak"
translations['nl']['moveItem'] = "Verplaats"
translations['nl']['myCloud'] = "Mijn Cloud"
translations['nl']['loginTitle'] = "Log in"
translations['nl']['registerTitle'] = "Maak een account"
translations['nl']['or'] = "of"
translations['nl']['loginButton'] = "Log in"
translations['nl']['registerButton'] = "Maak account"
translations['nl']['registerLink'] = "Maak een account (Eerste 10 GB gratis)"
translations['nl']['loginLink'] = "Log in"
translations['nl']['passwordRepeatPlaceholder'] = "Herhaal wachtwoord"
translations['nl']['emailPlaceholder'] = "E-mailadres"
translations['nl']['passwordPlaceholder'] = "Wachtwoord"
translations['nl']['2faPlaceholder'] = "2FA code (Laat veld leeg indien uitgeschakeld)"
translations['nl']['loginInvalidInputs'] = "Onjuist e-mailadres en wachtwoord"
translations['nl']['alertOkButton'] = "Ok"
translations['nl']['loginWrongCrednltials'] = "Onjuist e-mailadres, wachtwoord of 2FA code"
translations['nl']['apiRequestError'] = "Er is een fout opgetreden met uw verzoek, probeer het later opnieuw"
translations['nl']['registerInvalidFields'] = "Ongeldige formuliervelden"
translations['nl']['registerPasswordAtLeast10Chars'] = "Uw wachtwoord moet minimaal 10 tekens lang zijn"
translations['nl']['registerPasswordsDoNotMatch'] = "Wachtwoorden komen niet overeen"
translations['nl']['registerInvalidEmail'] = "Ongeldig e-mailadres"
translations['nl']['registerEmailAlreadyRegistered'] = "Het opgegeven e-mailadres is al geregistreerd"
translations['nl']['registerCouldNotSnldEmail'] = "Ok"
translations['nl']['alertOkButton'] = "We konden op dit moment geen e-mail verzenden, probeer het later opnieuw"
translations['nl']['registerSuccess'] = "Uw account is aangemaakt, bevestig uw e-mailadres door op de link te klikken die we naar u hebben toegestuurd"
translations['nl']['registerInvalidInputs'] = "Ongeldig e-mailadres, wachtwoord en bevestig wachtwoord"

module.exports = {
    get: (lang = "en", text, firstUpperCase = true, replaceFrom = [], replaceTo = []) => {
        let gotText = translations[lang][text]

        if(!gotText){
            return "NO_TRANSLATION_FOUND"
        }

        if(firstUpperCase){
            gotText = gotText.charAt(0).toUpperCase() + gotText.slice(1)
        }

        if(replaceFrom.length > 0 && replaceTo.length > 0){
            for(let i = 0; i < replaceFrom.length; i++){
                gotText = gotText.split(replaceFrom[i]).join(replaceTo[i])
            }
        }

        return gotText
    }
}
