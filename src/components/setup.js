import { Plugins, StatusBarStyle, Capacitor } from "@capacitor/core"
import { modalController, popoverController, actionSheetController } from "@ionic/core"
import * as language from "../utils/language"

export function setupListeners(){
    if(Capacitor.isNative){
        Plugins.App.addListener("backButton", async (e) => {
            let goBackHistory = true

            if(this.state.searchbarOpen){
                this.hideMainSearchbar(false)

                goBackHistory = false
            }

            let isModalActive = await modalController.getTop()

            if(isModalActive && this.state.isLoggedIn){
                window.customFunctions.dismissModal()

                goBackHistory = false
            }

            let isPopoverActive = await popoverController.getTop()

            if(isPopoverActive && this.state.isLoggedIn){
                window.customFunctions.dismissPopover()

                goBackHistory = false
            }

            let isActionSheetActive = await actionSheetController.getTop()

            if(isActionSheetActive && this.state.isLoggedIn){
                window.customFunctions.dismissActionSheet()

                goBackHistory = false
            }

            if(goBackHistory){
                window.history.back()
            }
        })
    }
}

export async function setupStatusbar(){
    if(Capacitor.isNative){
        Plugins.StatusBar.setBackgroundColor({
            color: "#ffffff"
        })
        
        Plugins.StatusBar.setStyle({
            style: StatusBarStyle.Light
        })
        
        Plugins.StatusBar.setOverlaysWebView({
            overlay: false
        })
    }
}

export async function doSetup(){
    let getLang = await Plugins.Storage.get({ key: "lang" })
    let getDarkMode = await Plugins.Storage.get({ key: "darkMode" })
    let getIsLoggedIn = await Plugins.Storage.get({ key: "isLoggedIn" })
    let getUserAPIKey = await Plugins.Storage.get({ key: "userAPIKey" })
    let getUserEmail = await Plugins.Storage.get({ key: "userEmail" })
    let getUserMasterKeys = await Plugins.Storage.get({ key: "userMasterKeys" })
    let getUserPublicKey = await Plugins.Storage.get({ key: "userPublicKey" })
    let getUserPrivateKey = await Plugins.Storage.get({ key: "userPrivateKey" })

    if(getLang.value){
        this.setState({
            lang: getLang.value,
            mainToolbarTitle: language.get(getLang.value, "myCloud")
        })

        window.customVariables.lang = getLang.value
    }
    else{
        this.setState({
            lang: "en",
            mainToolbarTitle: language.get("en", "myCloud")
        })

        window.customVariables.lang = "en"
    }

    if(getDarkMode.value == null){
        document.body.classList.toggle("dark", false)

        this.setState({
            darkMode: false
        })
    }
    else{
        if(getDarkMode.value == "true"){
            document.body.classList.toggle("dark", true)

            this.setState({
                darkMode: true
            })
        }
        else{
            document.body.classList.toggle("dark", false)

            this.setState({
                darkMode: false
            })
        }
    }

    if(getIsLoggedIn.value == null){
        return this.showLogin()
    }
    else{
        if(getIsLoggedIn.value == "true"){
            this.setState({
                userAPIKey: getUserAPIKey.value,
                userEmail: getUserEmail.value,
                userMasterKeys: JSON.parse(getUserMasterKeys.value),
                userPublicKey: getUserPublicKey.value,
                userPrivateKey: getUserPrivateKey.value,
                isLoggedIn: true
            })
        }
        else{
            return this.showLogin()
        }
    }

    if(Capacitor.isNative){
        Plugins.SplashScreen.hide()
    }

    window.customVariables.apiKey = getUserAPIKey.value

    this.updateUserKeys()
    this.updateUserUsage()

    clearInterval(window.customVariables.keyUpdateInterval)

    window.customVariables.keyUpdateInterval = setInterval(() => {
        this.updateUserKeys()
    }, 60000)

    clearInterval(window.customVariables.usageUpdateInterval)

    window.customVariables.usageUpdateInterval = setInterval(() => {
        this.updateUserUsage()
    }, 60000)

    return this.routeTo("/base")
}