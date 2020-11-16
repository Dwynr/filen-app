import { Plugins } from "@capacitor/core"
import { modalController, popoverController, menuController, alertController, loadingController, actionSheetController } from "@ionic/core"
import * as language from "../utils/language"
import * as Ionicons from 'ionicons/icons';

const utils = require("../utils/utils")

export function windowRouter(){
    window.onhashchange = async () => {
        if(window.currentHref !== window.location.href){
            window.currentHref = window.location.href

            this.setState({
                currentHref: window.currentHref
            })

            let routeEx = window.location.hash.split("/")

            if(this.state.isLoggedIn){
                if(routeEx[1] == "base" || routeEx[1] == "shared-in" || routeEx[1] == "shared-out" || routeEx[1] == "trash"){
                    await this.updateItemList()
    
                    let foldersInRoute = routeEx.slice(2)
    
                    if(foldersInRoute.length > 0){
                        let lastFolderInRoute = foldersInRoute[foldersInRoute.length - 1]
    
                        if(window.customVariables.cachedFolders[lastFolderInRoute]){
                            this.setState({
                                mainToolbarTitle: window.customVariables.cachedFolders[lastFolderInRoute].name,
                                showMainToolbarBackButton: true
                            })
                        }
                        else{
                            this.setState({
                                mainToolbarTitle: language.get(this.state.lang, "myCloud"),
                                showMainToolbarBackButton: false
                            })
                        }
                    }
                    else{
                        this.setState({
                            mainToolbarTitle: language.get(this.state.lang, "myCloud"),
                            showMainToolbarBackButton: false
                        })
                    }
                }
            }
        }
    }
}

export function setupWindowFunctions(){
    window.customFunctions = {}
    window.customVariables = {}

    window.customVariables.itemList = []
    window.customVariables.lang = this.state.lang
    window.customVariables.cachedFolders = {}
    window.customVariables.cachedFiles = {}
    window.customVariables.keyUpdateInterval = undefined
    window.customVariables.usageUpdateInterval = undefined
    window.customVariables.apiKey = ""
    window.customVariables.uploadSemaphore = new utils.Semaphore(10)
    window.customVariables.uploadChunkSemaphore = new utils.Semaphore(5)
    window.customVariables.downloadSemaphore = new utils.Semaphore(10)
    window.customVariables.downloadChunkSemaphore = new utils.Semaphore(30)
    window.customVariables.uploads = {}
    window.customVariables.downloads = {}
    window.customVariables.reloadContentAfterUploadTimeout = undefined

    window.onresize = () => {
        this.setState({
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth
        })
    }

    window.customFunctions.dismissActionSheet = async (all = false) => {
        if(all){
            await actionSheetController.dismiss()

            return true
        }

        try{
            let actionSheet = await actionSheetController.getTop()

            return actionSheet.dismiss()
        }
        catch(e){
            return console.log(e)
        }
    }

    window.customFunctions.dismissPopover = async (all = false) => {
        if(all){
            await popoverController.dismiss()

            return true
        }

        try{
            let popover = await popoverController.getTop()

            return popover.dismiss()
        }
        catch(e){
            return console.log(e)
        }
    }

    window.customFunctions.dismissModal = async (all = false) => {
        if(all){
            await modalController.dismiss()

            return true
        }

        try{
            let modal = await modalController.getTop()

            return modal.dismiss()
        }
        catch(e){
            return console.log(e)
        }
    }

    window.customFunctions.dismissLoader = async (all = false) => {
        if(all){
            await loadingController.dismiss()

            return true
        }

        try{
            let loader = await loadingController.getTop()

            return loader.dismiss()
        }
        catch(e){
            return console.log(e)
        }
    }

    window.customFunctions.selectAllItems = () => {
        let items = []

        for(let i = 0; i < this.state.itemList.length; i++){
            let item = this.state.itemList[i]

            item.selected = true

            items.push(item)
        }

        this.setState({
            itemList: items,
            selectedItems: items.length
        })

        return window.customFunctions.dismissPopover()
    }

    window.customFunctions.unselectAllItems = () => {
        let items = []

        for(let i = 0; i < this.state.itemList.length; i++){
            let item = this.state.itemList[i]

            item.selected = false

            items.push(item)
        }

        this.setState({
            itemList: items,
            selectedItems: 0
        })

        return window.customFunctions.dismissPopover()
    }

    window.customFunctions.refreshItemList = () => {
        this.updateItemList()

        return window.customFunctions.dismissPopover()
    }

    window.customFunctions.hideSidebarMenu = async () => {
        let mainMenu = await menuController.get("sideBarMenu")

        return mainMenu.close()
    }

    window.customFunctions.openRegisterModal = () => {
        return this.showRegister()
    }

    window.customFunctions.doLogout = async () => {
        await Plugins.Storage.set({ key: "isLoggedIn", value: "false" })
        await Plugins.Storage.set({ key: "userAPIKey", value: "" })
        await Plugins.Storage.set({ key: "userEmail", value: "" })
        await Plugins.Storage.set({ key: "userMasterKeys", value: JSON.stringify([]) })
        await Plugins.Storage.set({ key: "userPublicKey", value: "" })
        await Plugins.Storage.set({ key: "userPrivateKey", value: "" })

        this.setState({ isLoggedIn: false })

        return this.showLogin()
    }

    window.customFunctions.doLogin = async () => {
        let email = document.getElementById("login-email").value
        let password = document.getElementById("login-password").value
        let twoFactorKey = document.getElementById("login-2fa").value

        if(!email || !password){
            let alert = await alertController.create({
                header: "",
                subHeader: "",
                message: language.get(this.state.lang, "loginInvalidInputs"),
                buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
            })

            return alert.present()
        }

        if(twoFactorKey.length == 0){
            twoFactorKey = "XXXXXX"
        }

        let loading = await loadingController.create({
            message: ""
        })
    
        loading.present()

        try{
            var res = await utils.apiRequest("POST", "/v1/login", {
                email,
                password,
                twoFactorKey
            })
        }
        catch(e){
            document.getElementById("login-password").value = ""
            document.getElementById("login-2fa").value = ""

            console.log(e)

            window.customFunctions.dismissLoader()

            let alert = await alertController.create({
                header: "",
                subHeader: "",
                message: language.get(this.state.lang, "apiRequestError"),
                buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
            })

            return alert.present()
        }

        if(!res.status){
            document.getElementById("login-password").value = ""
            document.getElementById("login-2fa").value = ""

            window.customFunctions.dismissLoader()

            let alert = await alertController.create({
                header: "",
                subHeader: "",
                message: language.get(this.state.lang, "loginWrongCredentials"),
                buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
            })

            return alert.present()
        }

        await Plugins.Storage.set({ key: "isLoggedIn", value: "true" })
        await Plugins.Storage.set({ key: "userAPIKey", value: res.data.apiKey })
        await Plugins.Storage.set({ key: "userEmail", value: email })
        await Plugins.Storage.set({ key: "userMasterKeys", value: JSON.stringify([utils.hashFn(password)]) })

        window.customFunctions.dismissLoader(true)
        window.customFunctions.dismissModal(true)

        window.customFunctions.dismissLoader()

        document.getElementById("login-email").value = ""
        document.getElementById("login-password").value = ""
        document.getElementById("login-2fa").value = ""

        return this.doSetup()
    }

    window.customFunctions.doRegister = async () => {
        let email = document.getElementById("register-email").value
        let password = document.getElementById("register-password").value
        let passwordRepeat = document.getElementById("register-password-repeat").value

        if(!email || !password || !passwordRepeat){
            let alert = await alertController.create({
                header: "",
                subHeader: "",
                message: language.get(this.state.lang, "registerInvalidInputs"),
                buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
            })

            return alert.present()
        }

        let loading = await loadingController.create({
            message: ""
        })
    
        loading.present()

        try{
            var res = await utils.apiRequest("POST", "/v1/register", {
                email,
                password,
                passwordRepeat
            })
        }
        catch(e){
            document.getElementById("register-password").value = ""
            document.getElementById("register-password-repeat").value = ""

            console.log(e)

            window.customFunctions.dismissLoader()

            let alert = await alertController.create({
                header: "",
                subHeader: "",
                message: language.get(this.state.lang, "apiRequestError"),
                buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
            })

            return alert.present()
        }

        if(!res.status){
            document.getElementById("register-password").value = ""
            document.getElementById("register-password-repeat").value = ""

            window.customFunctions.dismissLoader()

            let message = ""

            if(res.message.toLowerCase().indexOf("invalid email") !== -1 || res.message.toLowerCase().indexOf("invalid password") !== -1 || res.message.toLowerCase().indexOf("invalid email") !== -1){
                message = language.get(this.state.lang, "registerInvalidFields")
            }
            else if(res.message.toLowerCase().indexOf("your password needs to be at least 10 characters long") !== -1){
                message = language.get(this.state.lang, "registerPasswordAtLeast10Chars")
            }
            else if(res.message.toLowerCase().indexOf("passwords do not match") !== -1){
                message = language.get(this.state.lang, "registerPasswordsDoNotMatch")
            }
            else if(res.message.toLowerCase().indexOf("invalid email") !== -1){
                message = language.get(this.state.lang, "registerInvalidEmail")
            }
            else if(res.message.toLowerCase().indexOf("database error") !== -1){
                message = language.get(this.state.lang, "apiRequestError")
            }
            else if(res.message.toLowerCase().indexOf("this email is already registered") !== -1){
                message = language.get(this.state.lang, "registerEmailAlreadyRegistered")
            }
            else if(res.message.toLowerCase().indexOf("we could not send an email at this time, please try again later") !== -1){
                message = language.get(this.state.lang, "registerCouldNotSendEmail")
            }

            let alert = await alertController.create({
                header: "",
                subHeader: "",
                message: message,
                buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
            })

            return alert.present()
        }

        document.getElementById("register-email").value = ""
        document.getElementById("register-password").value = ""
        document.getElementById("register-password-repeat").value = ""

        window.customFunctions.dismissLoader()

        let alert = await alertController.create({
            header: "",
            subHeader: "",
            message: language.get(this.state.lang, "registerSuccess"),
            buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
        })

        return alert.present()
    }

    window.customFunctions.openSettingsModal = async () => {
        let appLang = this.state.lang
        let modalId = "settings-modal-" + utils.generateRandomClassName()

        customElements.define(modalId, class ModalContent extends HTMLElement {
            connectedCallback(){
                this.innerHTML = `
                    <ion-header>
                        <ion-toolbar>
                            <ion-buttons slot="start">
                                <ion-button onClick="window.customFunctions.dismissModal()">
                                    <ion-icon slot="icon-only" icon="` + Ionicons.arrowBack + `"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                            <ion-title>
                                ` + language.get(appLang, "settings") + `
                            </ion-title>
                        </ion-toolbar>
                    </ion-header>
                    <ion-content fullscreen>
                        settings
                    </ion-content>
                `
            }
        })

        let modal = await modalController.create({
            component: modalId,
            swipeToClose: true,
            showBackdrop: false,
            backdropDismiss: false,
            cssClass: "modal-fullscreen"
        })

        modal.present()
    }

    window.customFunctions.openEncryptionModal = async () => {
        let appLang = this.state.lang
        let modalId = "encryption-modal-" + utils.generateRandomClassName()

        customElements.define(modalId, class ModalContent extends HTMLElement {
            connectedCallback(){
                this.innerHTML = `
                    <ion-header>
                        <ion-toolbar>
                            <ion-buttons slot="start">
                                <ion-button onClick="window.customFunctions.dismissModal()">
                                    <ion-icon slot="icon-only" icon="` + Ionicons.arrowBack + `"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                            <ion-title>
                                ` + language.get(appLang, "encryption") + `
                            </ion-title>
                        </ion-toolbar>
                    </ion-header>
                    <ion-content fullscreen>
                        encryption
                    </ion-content>
                `
            }
        })

        let modal = await modalController.create({
            component: modalId,
            swipeToClose: true,
            showBackdrop: false,
            backdropDismiss: false,
            cssClass: "modal-fullscreen"
        })

        modal.present()
    }

    window.customFunctions.openHelpModal = async () => {
        let appLang = this.state.lang
        let modalId = "help-modal-" + utils.generateRandomClassName()

        customElements.define(modalId, class ModalContent extends HTMLElement {
            connectedCallback(){
                this.innerHTML = `
                    <ion-header>
                        <ion-toolbar>
                            <ion-buttons slot="start">
                                <ion-button onClick="window.customFunctions.dismissModal()">
                                    <ion-icon slot="icon-only" icon="` + Ionicons.arrowBack + `"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                            <ion-title>
                                ` + language.get(appLang, "help") + `
                            </ion-title>
                        </ion-toolbar>
                    </ion-header>
                    <ion-content fullscreen>
                        help
                    </ion-content>
                `
            }
        })

        let modal = await modalController.create({
            component: modalId,
            swipeToClose: true,
            showBackdrop: false,
            backdropDismiss: false,
            cssClass: "modal-fullscreen"
        })

        modal.present()
    }

    window.customFunctions.queueFileUpload = this.queueFileUpload
    window.customFunctions.queueFileDownload = this.queueFileDownload
}