import * as language from "../utils/language"
import { loadingController, modalController, popoverController, alertController, actionSheetController } from "@ionic/core"
import * as Ionicons from 'ionicons/icons';

const utils = require("../utils/utils")

export async function updateItemList(){
	if(!this.state.isLoggedIn){
		return false
	}

	let routeEx = window.location.hash.split("/")
	let parent = routeEx[routeEx.length - 1]

    let loading = await loadingController.create({
        message: ""
    })

	loading.present()
	
	if(parent == "base"){
		try{
			var res = await utils.apiRequest("POST", "/v1/user/baseFolders", {
				apiKey: this.state.userAPIKey
			})
		}
		catch(e){
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
			console.log(res.message)
	
			window.customFunctions.dismissLoader()
	
			let alert = await alertController.create({
				header: "",
				subHeader: "",
				message: language.get(this.state.lang, "apiRequestError"),
				buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
			})
	
			return alert.present()
		}

		let items = []

		items.push({
			type: "folder",
			uuid: "default",
			name: "Default",
			date: "Default folder",
			timestamp: ((+new Date()) / 1000),
			parent: "base",
			receiverId: 0,
			receiverEmail: "",
			sharerId: 0,
			sharerEmail: ""
		})

		for(let i = 0; i < res.data.folders.length; i++){
			let folder = res.data.folders[i]

			let folderName = utils.decryptCryptoJSFolderName(folder.name, this.state.userMasterKeys, folder.uuid)
			let uploadDate = (new Date(folder.timestamp * 1000)).toString().split(" ")

			let item = {
				type: "folder",
				uuid: folder.uuid,
				name: folderName,
				date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
				timestamp: folder.timestamp,
				parent: "base",
				receiverId: 0,
				receiverEmail: "",
				sharerId: 0,
				sharerEmail: ""
			}

			items.push(item)

			window.customVariables.cachedFolders[folder.uuid] = item
		}

		window.customVariables.itemList = items

		this.setState({
			itemList: items
		})

		loading.dismiss()

		return true
	}
	else{
		if(routeEx[1] == "shared-in"){
			try{
				var usrPrivKey = await window.crypto.subtle.importKey("pkcs8", utils._base64ToArrayBuffer(this.state.userPrivateKey), {
					name: "RSA-OAEP",
					hash: "SHA-512"
				}, true, ["decrypt"])
			}
			catch(e){
				console.log(e)
		
				window.customFunctions.dismissLoader()
		
				let alert = await alertController.create({
					header: "",
					subHeader: "",
					message: language.get(this.state.lang, "unknownDeviceError"),
					buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
				})
		
				return alert.present()
			}

			try{
				var res = await utils.apiRequest("POST", "/v1/user/shared/in", {
					apiKey: this.state.userAPIKey,
					uuid: parent,
					folders: JSON.stringify(["shred-in"]),
					page: 1,
					app: "true"
				})
			}
			catch(e){
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
				console.log(res.message)
		
				window.customFunctions.dismissLoader()
		
				let alert = await alertController.create({
					header: "",
					subHeader: "",
					message: language.get(this.state.lang, "apiRequestError"),
					buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
				})
		
				return alert.present()
			}

			let items = []

			for(let i = 0; i < res.data.folders.length; i++){
				let folder = res.data.folders[i]

				try{
					let decrypted = await window.crypto.subtle.decrypt({
						name: "RSA-OAEP"
					}, usrPrivKey, utils._base64ToArrayBuffer(folder.metadata))

					let folderName = JSON.parse(new TextDecoder().decode(decrypted))

					folderName = folderName.name

					let uploadDate = (new Date(folder.timestamp * 1000)).toString().split(" ")

					let item = {
						type: "folder",
						uuid: folder.uuid,
						name: folderName,
						date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
						timestamp: folder.timestamp,
						parent: folder.parent,
						receiverId: 0,
						receiverEmail: "",
						sharerId: folder.sharerId,
						sharerEmail: folder.sharerEmail
					}

					items.push(item)

					window.customVariables.cachedFolders[folder.uuid] = item
				}
				catch(e){
					console.log(e)
				}
			}

			for(let i = 0; i < res.data.uploads.length; i++){
				let file = res.data.uploads[i]

				try{
					let decrypted = await window.crypto.subtle.decrypt({
						name: "RSA-OAEP"
					}, usrPrivKey, utils._base64ToArrayBuffer(file.metadata))

					let decryptedMetadata = JSON.parse(new TextDecoder().decode(decrypted))

					let uploadDate = (new Date(file.timestamp * 1000)).toString().split(" ")

					let offline = false

					let item = {
						type: "file",
						uuid: file.uuid,
						name: decryptedMetadata.name,
						mime: decryptedMetadata.mime,
						size: decryptedMetadata.size,
						key: decryptedMetadata.key,
						bucket: file.bucket,
						region: file.region,
						parent: file.parent,
						rm: file.rm,
						chunks: file.chunks,
						date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
						timestamp: file.timestamp,
						receiverId: 0,
						receiverEmail: "",
						sharerId: file.sharerId,
						sharerEmail: file.sharerEmail,
						offline: offline
					}

					items.push(item)

					window.customVariables.cachedFiles[file.uuid] = item
				}
				catch(e){
					console.log(e)
				}
			}

			window.customVariables.itemList = items

			this.setState({
				itemList: items
			})

			loading.dismiss()

			return true
		}
		else if(routeEx[1] == "shared-out"){
			try{
				var res = await utils.apiRequest("POST", "/v1/user/shared/out", {
					apiKey: this.state.userAPIKey,
					uuid: parent,
					folders: JSON.stringify(["default"]),
					page: 1,
					app: "true",
					receiverId: this.state.currentReceiverId
				})
			}
			catch(e){
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
				console.log(res.message)
		
				window.customFunctions.dismissLoader()
		
				let alert = await alertController.create({
					header: "",
					subHeader: "",
					message: language.get(this.state.lang, "apiRequestError"),
					buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
				})
		
				return alert.present()
			}

			let items = []

			for(let i = 0; i < res.data.folders.length; i++){
				let folder = res.data.folders[i]

				let folderName = utils.decryptCryptoJSFolderName(folder.metadata, this.state.userMasterKeys, folder.uuid)
				let uploadDate = (new Date(folder.timestamp * 1000)).toString().split(" ")

				let item = {
					type: "folder",
					uuid: folder.uuid,
					name: folderName,
					date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
					timestamp: folder.timestamp,
					parent: folder.parent,
					receiverId: folder.receiverId,
					receiverEmail: folder.receiverEmail,
					sharerId: 0,
					sharerEmail: ""
				}

				items.push(item)

				window.customVariables.cachedFolders[folder.uuid] = item
			}

			for(let i = 0; i < res.data.uploads.length; i++){
				let file = res.data.uploads[i]

				let metadata = utils.decryptFileMetadata(file.metadata, this.state.userMasterKeys, file.uuid)
				let uploadDate = (new Date(file.timestamp * 1000)).toString().split(" ")

				let offline = false

				let item = {
					type: "file",
					uuid: file.uuid,
					name: metadata.name,
					mime: metadata.mime,
					size: metadata.size,
					key: metadata.key,
					bucket: file.bucket,
					region: file.region,
					parent: file.parent,
					rm: file.rm,
					chunks: file.chunks,
					date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
					timestamp: file.timestamp,
					receiverId: file.receiverId,
					receiverEmail: file.receiverEmail,
					sharerId: 0,
					sharerEmail: "",
					offline: offline
				}

				items.push(item)

				window.customVariables.cachedFiles[file.uuid] = item
			}

			window.customVariables.itemList = items

			this.setState({
				itemList: items
			})

			loading.dismiss()

			return true
		}
		else{
			try{
				var res = await utils.apiRequest("POST", "/v1/dir/content", {
					apiKey: this.state.userAPIKey,
					uuid: parent,
					folders: JSON.stringify(["default"]),
					page: 1,
					app: "true"
				})
			}
			catch(e){
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
				console.log(res.message)
		
				window.customFunctions.dismissLoader()
		
				let alert = await alertController.create({
					header: "",
					subHeader: "",
					message: language.get(this.state.lang, "apiRequestError"),
					buttons: [language.get(this.state.lang, "alertOkButton").toUpperCase()]
				})
		
				return alert.present()
			}

			let items = []

			for(let i = 0; i < res.data.folders.length; i++){
				let folder = res.data.folders[i]

				let folderName = utils.decryptCryptoJSFolderName(folder.name, this.state.userMasterKeys, folder.uuid)
				let uploadDate = (new Date(folder.timestamp * 1000)).toString().split(" ")

				let item = {
					type: "folder",
					uuid: folder.uuid,
					name: folderName,
					date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
					timestamp: folder.timestamp,
					parent: folder.parent,
					receiverId: 0,
					receiverEmail: "",
					sharerId: 0,
					sharerEmail: ""
				}

				items.push(item)

				window.customVariables.cachedFolders[folder.uuid] = item
			}

			for(let i = 0; i < res.data.uploads.length; i++){
				let file = res.data.uploads[i]

				let metadata = utils.decryptFileMetadata(file.metadata, this.state.userMasterKeys, file.uuid)
				let uploadDate = (new Date(file.timestamp * 1000)).toString().split(" ")

				let offline = false

				let item = {
					type: "file",
					uuid: file.uuid,
					name: metadata.name,
					mime: metadata.mime,
					size: metadata.size,
					key: metadata.key,
					bucket: file.bucket,
					region: file.region,
					parent: file.parent,
					rm: file.rm,
					chunks: file.chunks,
					date: uploadDate[1] + " " + uploadDate[2] + " " + uploadDate[3] + " " + uploadDate[4],
					timestamp: file.timestamp,
					receiverId: 0,
					receiverEmail: "",
					sharerId: 0,
					sharerEmail: "",
					offline: offline
				}

				items.push(item)

				window.customVariables.cachedFiles[file.uuid] = item
			}

			window.customVariables.itemList = items

			this.setState({
				itemList: items
			})

			loading.dismiss()

			return true
		}
	}
}

export async function refreshMainList(event){
    await this.updateItemList()

    return event.detail.complete()
}

export function selectItem(type, index){
    let items = this.state.itemList
    let selectedItems = this.state.selectedItems

    if(type){
        if(!items[index].selected){
            items[index].selected = type
            selectedItems = selectedItems + 1
        }
    }
    else{
        if(items[index].selected){
            items[index].selected = type
            selectedItems = selectedItems - 1
        }
    }

    return this.setState({
        itemList: items,
        selectedItems
    })
}

export function clearSelectedItems(){
    let items = this.state.itemList

    for(let i = 0; i < items.length; i++){
        items[i].selected = false
    }

    return this.setState({
        itemList: items,
        selectedItems: 0
    })
}

export async function selectItemsAction(event){
    event.persist()

    let customElementId = utils.generateRandomClassName()

    window.customElements.define(customElementId, class ModalContent extends HTMLElement {
        connectedCallback(){
            this.innerHTML = `
                <ion-list>
                    <ion-item lines="none" detail="false" button onClick="window.customFunctions.selectAllItems()">Select all</ion-item>
                    <ion-item lines="none" detail="false" button onClick="window.customFunctions.unselectAllItems()">Unselect all</ion-item>
                    <ion-item lines="none" detail="false" button onClick="window.customFunctions.dismissPopover()">Close</ion-item>
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

export async function previewItem(item){
    console.log(item)

    let modalId = "preview-modal-" + utils.generateRandomClassName()

    customElements.define(modalId, class ModalContent extends HTMLElement {
        connectedCallback() {
              this.innerHTML = `
                <ion-header>
                      <ion-toolbar>
                        <ion-title>Modal Content</ion-title>
                        <ion-buttons slot="end">
                              <ion-button onclick="window.customFunctions.dismissModal()">Close</ion-button>
                        </ion-buttons>
                      </ion-toolbar>
                </ion-header>
            <ion-content fullscreen>
              <ion-list>
                <ion-item>
                  <ion-avatar slot="start">
                    <ion-img src="./avatar-gollum.jpg"/>
                  </ion-avatar>
                  <ion-label>
                    <h2>Gollum</h2>
                    <p>Sneaky little hobbitses!</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-avatar slot="start">
                    <ion-img src="./avatar-frodo.jpg"/>
                  </ion-avatar>
                  <ion-label>
                    <h2>Frodo</h2>
                    <p>Go back, Sam! I'm going to Mordor alone!</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-avatar slot="start">
                    <ion-img src="./avatar-samwise.jpg"/>
                  </ion-avatar>
                  <ion-label>
                    <h2>Samwise</h2>
                    <p>What we need is a few good taters.</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
          `;
        }
      });

    let modal = await modalController.create({
        component: modalId,
        swipeToClose: true
    })

    return modal.present()
}

export async function moveItem(item){

}

export async function renameItem(item){
	
}

export async function trashItem(item){
	
}

export async function shareItem(item){
	
}

export async function spawnItemActionSheet(item){
	let buttons = undefined

	if(item.type == "folder"){

	}
	else{
		buttons = [
			{
                text: language.get(this.state.lang, "downloadItem"),
                icon: Ionicons.download,
                handler: () => {
                    return this.queueFileDownload(item)
                }
			},
			{
                text: language.get(this.state.lang, "moveItem"),
                icon: Ionicons.download,
                handler: () => {
                    return this.moveItem(item)
                }
			},
			{
                text: language.get(this.state.lang, "renameItem"),
                icon: Ionicons.download,
                handler: () => {
                    return this.renameItem(item)
                }
            },
            {
                text: language.get(this.state.lang, "trashItem"),
                icon: Ionicons.trash,
                handler: () => {
                    return this.trashItem(item)
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
	}

    let actionSheet = await actionSheetController.create({
        header: item.name,
        buttons
    })

    return actionSheet.present()
}