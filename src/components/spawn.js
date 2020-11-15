import * as language from "../utils/language"
import * as utils from "../utils/utils"
import { toastController, actionSheetController, popoverController } from "@ionic/core"
import * as Ionicons from 'ionicons/icons';

export async function spawnToast(message, duration = 3000){
    let toast = await toastController.create({
        message,
        duration
    })

    return toast.present()
}

export async function spawnMoveToast(){
    let toast = await toastController.create({
        message: "Select destination",
        buttons: [
            {
                text: language.get(this.state.lang, "cancel"),
                role: "cancel",
                handler: () => {
                    console.log('Cancel clickded')
                }
            },
            {
                text: language.get(this.state.lang, "moveItem"),
                role: "cancel",
                handler: () => {
                    console.log('Move clicked')
                }
            }
        ]
    })

    return toast.present()
}

export async function spawnItemActionSheet(item){
    let actionSheet = await actionSheetController.create({
        header: item.name,
        buttons: [
            {
                text: language.get(this.state.lang, "trashItem"),
                icon: Ionicons.trash,
                handler: () => {
                    console.log("Trash clicked")
                }
            },
            {
                text: language.get(this.state.lang, "cancel"),
                icon: Ionicons.close,
                handler: () => {
                    return actionSheet.dismiss()
                }
            }
        ]
    })

    return actionSheet.present()
}

export async function mainFabAction(){
    let actionSheet = await actionSheetController.create({
        buttons: [
            {
                text: language.get(this.state.lang, "fabUploadFiles"),
                icon: Ionicons.cloudUpload,
                handler: async () => {
                    if(utils.currentParentFolder() == "base"){
                        this.routeTo("/base/default")
                    }

                    return document.getElementById("file-input-dummy").click()
                }
            },
            {
                text: language.get(this.state.lang, "fabCreateFolder"),
                icon: Ionicons.folderOpen,
                handler: () => {
                    return false
                }
            },
            {
                text: language.get(this.state.lang, "cancel"),
                icon: Ionicons.close,
                handler: () => {
                    return actionSheet.dismiss()
                }
            }
        ]
    })

    return actionSheet.present()
}

export async function mainMenuPopover(event){
    event.persist()

    let customElementId = utils.generateRandomClassName()

    window.customElements.define(customElementId, class ModalContent extends HTMLElement {
        connectedCallback(){
            this.innerHTML = `
                <ion-list>
                    <ion-item lines="none" detail="false" button onClick="window.customFunctions.refreshItemList()">` + language.get(window.customVariables.lang, "refresh") + `</ion-item>
                    <ion-item lines="none" detail="false" button onClick="window.customFunctions.dismissPopover()">` + language.get(window.customVariables.lang, "close") + `</ion-item>
                </ion-list>
            `
        }
    })

    let popover = await popoverController.create({
        component: customElementId,
        event: event
    })

    return popover.present()
}