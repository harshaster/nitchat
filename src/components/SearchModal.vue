<template>
    <dialog ref="modal" :open="this.open">
		<article>
			<header>
				<button @click="this.$emit('close')" aria-label="Close" rel="prev"></button>
				<p>
					<strong><i class="fas fa-compass"></i> Add</strong>
				</p>
			</header>
			<form @submit.prevent="this.addConn">
                <fieldset>
                    <input type="text" placeholder="Username" v-model="this.username" :disabled="this.peerId!=''">
                    <label>or</label>
                    <input type="text" placeholder="Peer ID" v-model="this.peerId" :disabled="this.username!=''">
                    <button type="submit">Add</button>
                </fieldset>
            </form>
		</article>
	</dialog>
</template>

<script>
export default {
    props: ['open'],
    data() {
        return {
            username: '',
            peerId: ''
        }
    },
    methods: {
        addConn() {
            if(this.username === '' && this.peerId === '') return
            this.$emit('addNewConnection', this.username, this.peerId)
        }
    }
}
</script>