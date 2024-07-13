<template>
	<main style="margin-top: 1rem;">
		<HomeView 
			v-if="this.showHome" 
			:peerId="this.peerId" 
			:online="this.online"
			:connections="this.connections"
			@deleteConn="(i) => {this.deleteConn(i)}"
			@addNewConnection="this.addNewConnection"
			@selectedChat="(i) => handleChatSelected(i)"
			@playSound="this.playSound"
		/>
		<ChatView 
			v-else-if="this.selectedChat"
			:key="this.selectedChat.conn.connectionId"
			:conn="this.selectedChat"
			@updateMessages="(messages) => {this.selectedChat.messages = messages}"
			@reConnect="(peerId)=>this.reConnect(peerId)"
			@editName="(peerId)=>this.editName(peerId)"
			@playSound="this.playSound"
		/>		
	</main>
</template>

<script>
import notification from '@/assets/new-notification-7-210334.mp3'
import HomeView from './components/HomeView.vue'
import ChatView from './components/ChatView.vue'
import { Peer } from 'peerjs'

export default {
	name: 'App',
	data() {
		return {
			selectedChat: null,
			peer_obj: null,
			peerId: null,
			online : false,
			connections: [],
			showHome: true
		}
	},
	components: {
		HomeView,
		ChatView
	},
	watch: {
		connections: {
			handler() {
				let out = this.connections.map(c => {
					return{
						peerId : c.peerId,
						messages : c.messages,
						title : c.title
					}
				})
				localStorage.setItem('nitchat30095069_connections', JSON.stringify(out))
			},
			deep: true
		}
	},
	created() {
		this.getLocalConnections()
		let peerId = localStorage.getItem('nitchat30095069_peerId')

		if (peerId) {
			this.peerId = peerId
			this.peer_obj = new Peer(peerId)
		}
		else {
			this.peer_obj = new Peer()
			this.peer_obj.on('open', id => {
				this.peerId = id
				localStorage.setItem('nitchat30095069_peerId', id)
			})
		}

		this.peer_obj.on('open', id => {
			this.online = true
			this.peerId = id
		})
		this.peer_obj.on('connection', conn => {
			let peerExists = this.connections.find(c => c.peerId === conn.peer)
			if (peerExists) {
				peerExists.conn = conn
				peerExists.new = true

				conn.on('data', data => {
					if(this.showHome){
						peerExists.newMsg = true
						peerExists.messages.push({
							text: data,
							self: false,
							timestamp: new Date().getTime()
						})
						this.playSound()
					}
				})
			}
			else {
				this.connections.push({
					conn,
					peerId: conn.peer,
					messages: [],
					new: true,
					title: conn.peer
				})
			}
		})
	},
	methods : {
		deleteConn(i) {
			if (this.selectedChat && (this.selectedChat.peerId === this.connections[i].peerId)){
				this.showHome = true
				this.selectedChat = null
			}
			if (this.connections[i].conn && this.connections[i].open){
				this.connections[i].conn.close()
			}
			this.connections.splice(i, 1)
		},
		getLocalConnections() {
			let conns = localStorage.getItem('nitchat30095069_connections')
			if (conns) {
				this.connections = JSON.parse(conns).map(c => {
					return {
						conn: null,
						peerId: c.peerId,
						messages: c.messages,
						title : c.title
					}
				})
			}
		},
		addNewConnection() {
			let peerId = prompt('Enter the peer ID')
			if(!peerId) return
			this.connections.push({
				conn : null,
				peerId,
				messages: [],
				title: peerId
			})
		},
		handleChatSelected(i){
			this.showHome=false
			let chat = this.connections[i]
			if(chat.new){
				chat.new = false
			}
			if (chat.conn && chat.conn.open){
				this.selectedChat = chat
			}
			else{
				chat.conn = this.peer_obj.connect(chat.peerId)
				chat.conn.on('error', err => {
					alert('An error occured while connecting to the peer' , err)
				})
			}
			this.selectedChat = this.connections[i]
		},
		playSound(){
			let audio = new Audio(notification)
			audio.play()
		},
		reConnect(peerId){
			let chat = this.connections.find(c => c.peerId === peerId)
			if(chat.conn && chat.conn.open){
				this.selectedChat = chat
			}
			else{
				chat.conn = this.peer_obj.connect(chat.peerId)
				chat.conn.on('error', err => {
					alert("Can't connect to the peer. Peer might be offline." , err.type)
				})
			}
		},
		editName(peerId){
			let name = prompt('Enter the new name')
			if(!name) return
			let chat = this.connections.find(c => c.peerId === peerId)
			chat.title = name
		}
	}
}
</script>