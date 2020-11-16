import * as language from "../utils/language"
import * as workers from "../utils/workers"
import { Capacitor, FilesystemDirectory, Plugins } from "@capacitor/core"

const utils = require("../utils/utils")

export async function getDownloadDir(makeOffline, fileName, callback){
    if(Capacitor.platform == "android"){
        let path = "Downloads"
        let directory = FilesystemDirectory.External

        if(makeOffline){
            path = "OfflineFiles/" + fileName
        }

        try{
            await Plugins.Filesystem.mkdir({
                path,
                directory,
                recursive: true 
            })

            await Plugins.Filesystem.mkdir({
                path,
                directory,
                recursive: true
            })

            var uri = await Plugins.Filesystem.getUri({
                path,
                directory
            })

            return callback(null, {
                path,
                directory,
                uri
            })
        }
        catch(e){
            if(e.message == "Directory exists"){
                try{
                    var uri = await Plugins.Filesystem.getUri({
                        path,
                        directory
                    })

                    return callback(null, {
                        path,
                        directory,
                        uri
                    })
                }
                catch(e){
                    return callback(e)
                }
            }
            else{
                return callback(e)
            }
        }
    }
    else if(Capacitor.platform == "ios"){
        return callback(new Error("ios not yet implemented"))
    }
    else{
        return callback(new Error("Can only run getdir function on native ios or android device"))
    }
}

export async function downloadFileChunk(file, index, tries, maxTries, callback){
    if(tries >= maxTries){
		return callback(new Error("Max download retries reached for " + file.uuid + ", returning."))
	}

	if(index >= file.chunks){
		return callback(null, index)
    }
    
    fetch(utils.getDownloadServer() + "/" + file.region + "/" + file.bucket + "/" + file.uuid + "/" + index, {
        method: "GET"
    }).then((response) => {
        response.text().then((res) => {
            try{
                if(res.length > 0){
                    workers.decryptData(file.uuid, index, file.key, res, (decrypted) => {
                        return callback(null, index, decrypted)
                    })
                }
                else{
                    return setTimeout(() => {
                        this.downloadFileChunk(file, index, (tries + 1), maxTries, callback)
                    }, 1000)
                }
            }
            catch(e){
                console.log(e)

                return setTimeout(() => {
                    this.downloadFileChunk(file, index, (tries + 1), maxTries, callback)
                }, 1000)
            }
        }).catch((err) => {
            console.log(err)

            return setTimeout(() => {
                this.downloadFileChunk(file, index, (tries + 1), maxTries, callback)
            }, 1000)
        })
    }).catch((err) => {
        console.log(err)

        return setTimeout(() => {
            this.downloadFileChunk(file, index, (tries + 1), maxTries, callback)
        }, 1000)
    })
}

export async function queueFileDownload(file){
    for(let prop in window.customVariables.downloads){
		if(window.customVariables.downloads[prop].name == file.name){
			return this.spawnToast(language.get(this.state.lang, "fileDownloadAlreadyDownloadingFile", true, ["__NAME__"], [file.name]))
		}
    }
    
    let uuid = file.uuid
	let name = file.name
	let size = file.size
	let currentIndex = -1

	let ext = file.name.split(".")
	ext = ext[ext.length - 1].toLowerCase()

    let makeOffline = false
    let fileName = file.name

	if(typeof file.makeOffline !== "undefined"){
        makeOffline = true
        fileName = file.uuid
    }

    this.getDownloadDir(makeOffline, fileName, (err, dirObj) => {
        if(err){
            console.log(err)

            return this.spawnToast(language.get(this.state.lang, "couldNotGetDownloadDir"))
        }

        const addToState = () => {
			let currentDownloads = this.state.downloads

			currentDownloads[uuid] = {
				uuid,
				size,
                chunks: file.chunks,
                name: file.name,
                mime: file.mime,
                chunksDone: 0,
                nextWriteChunk: 0,
                chunksWritten: 0,
				loaded: 0,
                progress: 0,
                makeOffline: file.makeOffline
			}

			window.customVariables.downloads[uuid] = {
				uuid,
				size,
                chunks: file.chunks,
                name: file.name,
                mime: file.mime,
                chunksDone: 0,
                nextWriteChunk: 0,
                chunksWritten: 0,
				loaded: 0,
                progress: 0,
                makeOffline: file.makeOffline
			}

			return this.setState({
				downloads: currentDownloads,
				downloadsCount: (this.state.downloadsCount + 1)
			})
		}

		const removeFromState = () => {
			let currentDownloads = this.state.downloads

			delete currentDownloads[uuid]
			delete window.customVariables.downloads[uuid]

			return this.setState({
				downloads: currentDownloads,
				downloadsCount: (this.state.downloadsCount - 1)
			})
		}

		const setProgress = (progress) => {
			try{
				let currentDownloads = this.state.downloads

				currentDownloads[uuid].progress = progress
				window.customVariables.downloads[uuid].progress = progress

				return this.setState({
					downloads: currentDownloads
				})
			}
			catch(e){
				return console.log(e)
			}
		}

		const setLoaded = (moreLoaded) => {
			try{
				let currentDownloads = this.state.downloads

				currentDownloads[uuid].loaded += moreLoaded
				window.customVariables.downloads[uuid].loaded += moreLoaded

				return this.setState({
					downloads: currentDownloads
				})
			}
			catch(e){
				return console.log(e)
			}
        }
        
        const chunksDonePlus = () => {
            try{
				let currentDownloads = this.state.downloads

				currentDownloads[uuid].chunksDone += 1
				window.customVariables.downloads[uuid].chunksDone += 1

				return this.setState({
					downloads: currentDownloads
				})
			}
			catch(e){
				return console.log(e)
			}
        }

		addToState()

        this.spawnToast(language.get(this.state.lang, "fileDownloadStarted", true, ["__NAME__"], [file.name]))
        
        let downloadInterval = setInterval(() => {
            currentIndex += 1

            let thisIndex = currentIndex

            if(thisIndex < file.chunks && typeof window.customVariables.downloads[uuid] !== "undefined"){
                this.downloadFileChunk(file, thisIndex, 0, 10, (err, downloadIndex, downloadData) => {
                    if(err){
                        console.log(err)

                        removeFromState()

                        return this.spawnToast(language.get(this.state.lang, "fileDownloadError", true, ["__NAME__"], [file.name]))
                    }

                    if(typeof window.customVariables.downloads[uuid] !== "undefined"){
                        chunksDonePlus()
                        setLoaded(downloadData.length)

                        try{
                            let progress = ((window.customVariables.downloads[uuid].loaded / window.customVariables.downloads[uuid].size) * 100).toFixed(2)

                            if(progress >= 100){
                                progress = 100
                            }

                            setProgress(progress)
                        }
                        catch(e){
                            console.log(e)
                        }

                        console.log(uuid, downloadIndex, downloadData.length)

                        //writeToLocalFile(writer, uuid, downloadIndex, downloadData)
                    }
                })
            }
            else{
                clearInterval(downloadInterval)
            }
        }, 100)
    })
}