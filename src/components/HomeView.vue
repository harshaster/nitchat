<template>
    <div class="container">
        <p style="margin: 0">Your ID</p>
        <div style="display: flex;justify-content: space-between;align-items: center;">
            <div>
                <code>{{ this.peerId }}</code>
                <span id="copy-id" @click="this.copyPeerId">
                    <i class="fas fa-copy"></i> &nbsp;
                    <code v-if="this.copied">Copied!</code>
                </span>
            </div>
            <hgroup v-if="this.publicProfile">
                <h4>{{ publicProfile.username }}</h4>
                <p><a href="#" @click="this.changeName"><i class="fas fa-pen"></i></a> {{ publicProfile.name }}</p>
            </hgroup>
            <div v-else>
                <button @click="this.makePublicProfile(this.peerId)" style="padding: 5px; margin: 0 3px;font-size: 80%;">Make Public</button>
                <a @click="this.getPublicProfile"><i class="fa fa-refresh"></i></a>
            </div>
        </div>
        <span>{{ this.online ? 'Online' : 'Offline' }}</span>
        <button @click="this.openModal=true" id="add-new">
            <i class="fas fa-add"></i>
        </button>
    </div>
    <div style="margin-top: 2vh;" class="container">
        <h1>Chats</h1>
        <div v-for="(connection, i) in this.connections" :key=i>
            <button @click="this.$emit('selectedChat', i)" style="width: 100%;margin: 10px 0;text-align: start;"
                @contextmenu.prevent="this.deleteConn(i)">
                <div class="grid" style="justify-content: space-between;">
                    <div>
                        <b>
                            {{ connection.title || connection.peerId }}
                            <div style="display: inline;" v-if="connection">
                                <span v-if="connection.new">
                                    <i class="fas fa-link"></i>
                                </span>
                                <span v-if="connection.newMsg"><mark>New</mark></span>
                            </div>
                        </b>
                        <p style="font-size: 80%;color: #fff3;margin: 0"><em>{{ connection.peerId }}</em></p>
                        <p style="margin-bottom: 3px;color: #fff5" class="grid">{{ this.lastmsg(i) }}</p>
                    </div>
                </div>
            </button>
        </div>
    </div>
    <SearchModal :open="this.openModal" @addNewConnection="(u,p)=>this.addNewConnection(u,p)" @close="this.openModal=false"/>
</template>

<style scoped>
#add-new {
    position: absolute;
    right: 20px;
    bottom: 20px;
}

#copy-id {
    cursor: pointer;
}

ul {
    list-style: none;
    list-style-type: none;
    list-style-image: none;
}
</style>
<script>
import { Client, Databases, Query } from 'appwrite';
import SearchModal from './SearchModal.vue'
export default {
    data() {
        return {
            copied: false,
            appwrite_client: null,
            dbCLient: null,
            public: false,
            publicProfile: false,
            openModal: false
        }
    },
    emits: ['addNewConnection', 'deleteConn', 'selectedChat'],
    props: ['peerId', 'connections', 'online'],
    components: {
        SearchModal
    },
    methods: {
        changeName() {
            let name = prompt('Enter your new name')
            if (!name) return
            this.dbCLient.updateDocument(
                '664be0cd0025681b946f',
                '6693a99c000b98aa8af0',
                this.publicProfile.$id,
                {
                    name: name
                }
            ).then((res) => {
                this.publicProfile = res
                this.$emit('profileUpdate', res)
            }).catch((e) => {
                alert(e.message)
            })
        },
        initAppwrite() {
            const appwrite = new Client()
            appwrite
                .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
                .setProject('664be05c000260735ae6') // Your project ID
            return appwrite
        },
        copyPeerId() {
            navigator.clipboard.writeText(this.peerId)
            this.copied = true
            setTimeout(() => {
                this.copied = false
            }, 2000)
        },
        async addNewConnection(username, peerId) {
            let outPeerId = null
            let name = null
            if (username) {
                try{
                    let res = await this.dbCLient.getDocument(
                        '664be0cd0025681b946f',
                        '6693a99c000b98aa8af0',
                        username
                    )
                    outPeerId = res.peerId
                    name = res.name
                    this.$emit('addNewConnection', outPeerId, name)
                }
                catch(e){
                    alert('User not found')
                }
                finally{
                    this.openModal = false
                }
            }
            else{
                outPeerId = peerId
                this.openModal = false
                this.$emit('addNewConnection', outPeerId, name)
            }
        },
        deleteConn(i) {
            let prompt = window.confirm('Are you sure you want to delete this connection?')
            if (!prompt) return
            this.$emit('deleteConn', i)
        },
        lastmsg(i) {
            let conn = this.connections[i]
            if (conn.messages.length > 0) {
                let last_msg = conn.messages[conn.messages.length - 1]
                return `${last_msg.self ? 'You: ' : ''}${last_msg.text.length > 20 ? last_msg.text.slice(0, 20) + '...' : last_msg.text}`
            }
            return ''
        },
        async makePublicProfile(newVal) {
            let user_name = prompt('Do you want to make yourself public? (This will allow others to find you by your ID). If yes please enter your public username.')
            if (!user_name){
                localStorage.setItem('nitchat30095069_isPublic_pref', false)
                return
            }

            this.dbCLient.createDocument(
                '664be0cd0025681b946f',
                '6693a99c000b98aa8af0',
                user_name,
                {
                    peerId: newVal,
                    created: new Date(),
                    username: user_name,
                    name: user_name
                }
            ).then((res) => {
                console.log(res)
                localStorage.setItem('nitchat30095069_isPublic', JSON.stringify(res))
                this.publicProfile = res
                this.$emit('profileUpdate', res)
            }).catch((e) => {
                alert(e.message)
            })
        },
        async getPublicProfile(){
            let res = await this.dbCLient.listDocuments(
                '664be0cd0025681b946f', 
                '6693a99c000b98aa8af0', 
                [
                    Query.equal('peerId', this.peerId)
                ]
            )
            if(res.documents.length > 0){
                this.publicProfile = res.documents[0]
            }
            else{
                this.publicProfile = false
            }
        }
    },
    async created() {
        let isPublic = localStorage.getItem('nitchat30095069_isPublic')
        this.appwrite_client = this.initAppwrite()
        this.dbCLient = new Databases(this.appwrite_client)
        if (!isPublic) {
            let pref  = localStorage.getItem('nitchat30095069_isPublic_pref')
            if(pref === 'false'){
                return
            }
            if(this.peerId){
                this.makePublicProfile(this.peerId)
            }
        }
        else {
            this.publicProfile = JSON.parse(isPublic)
        }
    }
}
</script>