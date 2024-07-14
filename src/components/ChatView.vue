<template>
    <div class="container" style="position: relative">
        <header>
            <hgroup>
                <h5>
                    {{this.conn.title || this.conn.peerId}}
                    <button style="scale: 0.7;" @click="this.$emit('editName', this.conn.peerId)"><i class="fas fa-pen"></i></button>
                </h5>
                <p><GreenDot v-if="this.online"/> {{ this.online ? 'Online' : 'Offline' }}</p>
                <a href="#" @click="this.$emit('reConnect', this.conn.peerId)"  v-if="!this.online">Reconnect <i class="fas fa-refresh"></i></a>
            </hgroup>

        </header>
        <main style="position: relative;height: 85dvh;">
            <div class="chat-box" ref="chatBox">
                <p v-for="(m,i) in this.messages" :key=i :class="{'self' : m.self, 'other' : !m.self}">
                    <span id="text-box">
                        <span class="text">{{m.text}}</span>
                        <br>
                        <span class="time">{{new Date(m.timestamp).toLocaleTimeString()}} <span v-if="new Date().toDateString()!=new Date(m.timestamp).toDateString()">{{new Date(m.timestamp).toLocaleDateString()}}</span></span>
                    </span>
                </p>
            </div>
           <div style="position:absolute;bottom: 0;width: 100%;">
                <fieldset role="group">
                    <input v-model="this.message" type="text" placeholder="Type a message" ref="messageInp">
                    <button @click="this.send_message"><i class="fas fa-paper-plane"></i></button>
                </fieldset>
            </div>
        </main>
    </div>
</template>

<style scoped>
.chat-box{
    max-height: 70vh;
    overflow-y: auto;
    margin-bottom: 10vh;
    scrollbar-width: 0;
}
#text-box{
    max-width: 70%;
    padding: 0.1rem 0.6rem;
    display: inline-block;
    border-radius: var(--pico-border-radius);
}
#text-box .time{
    font-size: 0.7rem;
    color: #fff7
}
p.self{
    text-align: right;
    margin-right: 1rem;
}

p.self #text-box{
    background-color: var(--pico-primary-background);
    color: white;
    margin-left: auto;
}
p.other #text-box{
    background-color: var(--pico-secondary-background);
    color: white;
}
p.other{
    text-align: left;
    margin-left: 1rem;
}
</style>

<script>
import GreenDot from './GreenDot.vue'
export default {
    props: ['conn'],
    components: {
        GreenDot
    },
    data(){
        return {
            message: '',
            messages: [],
            online : false,
        }
    },
    watch: {
        messages : {
            handler(){
                this.$emit('updateMessages', this.messages)
            },
            deep: true
        },
        conn : {
            handler(){
                this.online = this.conn.conn.open
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        send_message(){
            if(!this.online){
                this.$emit('reConnect', this.conn.peerId)
                return
            }
            this.conn.conn.send(this.message)
            this.messages.push({
                text: this.message,
                self: true,
                timestamp : new Date().getTime()
            })
            this.$emit('playSound')
            this.message = ''
            this.$refs.messageInp.focus()
        },
        scrollToBottom(){
            this.$refs.chatBox.scrollTo(0, this.$refs.chatBox.clientHeight + this.$refs.chatBox.scrollHeight)
        }
    },
    updated(){
        this.scrollToBottom()
    },
    created(){
        this.messages = this.conn.messages
        this.conn.conn.on('data', (data) => {
            this.messages.push({
                text: data,
                self: false,
                timestamp : new Date().getTime()
            })
            this.$emit('playSound', this.conn.peerId)
        })
        if(this.conn.conn.open){
            this.online = true
        }
        else{
            this.conn.conn.on('open', () => {
                this.online = true
            })
        }
        this.conn.conn.on('close', () => {
            this.online = false
        })
        this.conn.conn.on('error', () => {
            this.online = false
        })
        this.conn.conn.on('disconnected', () => {
            this.online = false
        })
        
    },
    mounted(){
        this.scrollToBottom()
    },
    unmouted(){
        this.conn.conn.close()
    }
}
</script>