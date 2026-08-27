<template>
    <div v-if="userData">
        <h3>{{ title }} {{ userData.email }}</h3>
        <p>Ранк: {{ userData.rankName }}</p>
    </div>

    <!-- <ModalCreateTransferVue v-if="userData" :userName="userName"></ModalCreateTransferVue> -->

    <Statistics v-if="userData" :userName="userData.name"></Statistics>

</template>

<script>

    import Statistics from '@/components/Statistics.vue';
    import ModalCreateTransferVue from '@/components/ModalCreateTransfer.vue';

    export default {
        data() {
            return {
                title: "Личный кабинет",
                userData: null,
                userName: null,
            }
        },
        components: {
            Statistics,
            ModalCreateTransferVue
        },
        mounted() {
            const userObjectString = localStorage.getItem('userObject');

            if (userObjectString) {
                this.userData = JSON.parse(userObjectString);
                this.userName = this.userData.name
                console.log(this.userData);
            }
        }
    }

</script>