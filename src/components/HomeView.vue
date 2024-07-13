<template>
    <div class="container">
        <p style="margin: 0">Your ID</p>
        <div class="grid">
            <code>{{ this.peerId }}</code>
            <span id="copy-id" @click="this.copyPeerId">
                <i class="fas fa-copy"></i> &nbsp;
                <code v-if="this.copied">Copied!</code>
            </span>
        </div>
        <span>{{ this.online ? 'Online' : 'Offline' }}</span>
        <button @click="addNewConnection" id="add-new">
            <i class="fas fa-add"></i>
        </button>
    </div>
    <div style="margin-top: 2vh;" class="container">
        <h1>Chats</h1>
        <div v-for="(connection, i) in this.connections" :key=i>
            <button @click="this.$emit('selectedChat', i)" style="width: 100%;text-align: start;" @contextmenu.prevent="this.deleteConn(i)">
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
// import GreenDot from './GreenDot.vue'
export default {
    data() {
        return {
            copied: false
        }
    },
    components: {
        // GreenDot
    },
    emits: ['addNewConnection', 'deleteConn', 'selectedChat'],
    props: ['peerId', 'connections', 'online'],
    methods: {
        copyPeerId() {
            navigator.clipboard.writeText(this.peerId)
            this.copied = true
            setTimeout(() => {
                this.copied = false
            }, 2000)
        },
        addNewConnection() {
            this.$emit('addNewConnection')
        },
        deleteConn(i) {
            let prompt = window.confirm('Are you sure you want to delete this connection?')
            if(!prompt) return
            this.$emit('deleteConn', i)
        },
        lastmsg(i){
            let conn = this.connections[i]
            if (conn.messages.length > 0) {
                let last_msg = conn.messages[conn.messages.length - 1]
                return `${last_msg.self ? 'You: ' : ''}${last_msg.text.length > 20 ? last_msg.text.slice(0, 20) + '...' : last_msg.text}`
            }
            return ''
        }
    },
}
</script>