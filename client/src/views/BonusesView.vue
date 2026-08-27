<template>
    <h3>{{ title }}</h3>

    <div style="width: 30%;">
        <el-input v-model="gte" type="date"></el-input>
        <el-input v-model="lte" type="date" style="margin-top: 10px"></el-input>
        <el-button @click="fetchBonuses" style="margin-top: 10px">Искать</el-button>
        <el-button @click="isShowModalToBonus = true" style="margin-top: 10px">Создать бонус</el-button>
    </div>

    <div v-if="bonusesData">
        <el-table :data="bonusesData">
            <el-table-column label="Дата" prop="bonusDate"></el-table-column>
            <el-table-column label="Тип бонуса" prop="bonusType"></el-table-column>
            <el-table-column label="Название" prop="bonusText"></el-table-column>
            <el-table-column label="Лидоруб" prop="bonusUserName"></el-table-column>
            <el-table-column label="Бонус" prop="bonusValue"></el-table-column>
        </el-table>
    </div>

    <el-dialog title="Создать ручной бонус" v-model="isShowModalToBonus" width="500px">
        
        <el-input v-model="newHandBonus.bonusDate" type="date"></el-input>

        <el-select v-model="newHandBonus.bonusText" style="margin-top: 10px">
            <el-option v-for="(type, index) in allBonusTexts" :label="type" :value="type"></el-option>
        </el-select>

        <!-- <el-select v-model="newHandBonus.bonusUserName" style="margin-top: 10px">
            <el-option v-for="(user, idx) in usersList" :label="user.name" :value="user.name"></el-option>
        </el-select> -->

        <FormItemSelect v-if="usersList.length > 0" v-model="newHandBonus.bonusUserName" :options="usersList" valueKey="name" labelKey="name" />

        <el-input v-model="newHandBonus.bonusValue" style="margin-top: 10px" type="number"></el-input>
    
        <el-button @click="createNewHandBonus" style="margin-top: 10px" type="success" plain>Создать новый бонус</el-button>

    </el-dialog>

</template>

<script>

    import dayjs from 'dayjs';

    import { ElMessage } from 'element-plus';
    import FormItemSelect from '../components/FormItemSelect.vue'


    export default {
        data() {
            return {
                title: "Бонусы",
                gte: dayjs(new Date).format('YYYY-MM-DD'),
                lte: dayjs(new Date).format('YYYY-MM-DD'),
                bonusesData: null,
                isShowModalToBonus: false,
                allBonusTexts: ['Ручной бонус'],
                bonusesTypes: [{type: 'handBonus', text: 'Ручной бонус'}],
                usersList: null,
                newHandBonus: {
                    bonusDate: dayjs(new Date).format('YYYY-MM-DD'),
                    bonusType: null,
                    bonusText: null,
                    bonusValue: 500,
                    bonusUserName: null,
                    bonusUserId: null,
                    userEmail: null,
                }
            }
        },
        components: {
            FormItemSelect
        },
        methods: {
            async fetchBonuses() {
                try {
                    const response = await this.$store.dispatch('getDataList', {
                        col: 'api/bonuses/getAll',
                        params: {
                            gte: this.gte,
                            lte: this.lte
                        }
                    })
                    this.bonusesData = response.data
                    console.log(this.bonusesData, '!!!!')
                } catch (e) {
                    console.log(e.message)
                }
            },
            async fetchLidorubs() {
                try {
                    const response = await this.$store.dispatch('getDataList', {
                        col: 'api/users/getList',
                        params: {}
                    })
                    this.usersList = response.data
                } catch (e) {
                    console.log(e.message)
                }
            },
            async createNewHandBonus() {
                try {

                    console.log(this.newHandBonus)


                    let typeBonusObject = this.bonusesTypes.find((item) => {
                        return item.text === this.newHandBonus.bonusText
                    })

                    let userObject = this.usersList.find((user) => {
                        return user.name === this.newHandBonus.bonusUserName
                    })

                    if (typeBonusObject) {
                        this.newHandBonus.bonusType = typeBonusObject.type
                    }

                    if (userObject) {
                        this.newHandBonus.bonusUserId = userObject._id
                        this.newHandBonus.userEmail = userObject.email
                    }

                    console.log(this.newHandBonus)

                    const result = await this.$store.dispatch('createDataList', {
                        col: 'api/bonuses/createHand',
                        data: {
                            newHandBonus: this.newHandBonus
                        }
                    })

                    ElMessage({
                        message: result.msg,
                        type: 'success',
                    });

                    this.isShowModalToBonus = false

                } catch (e) {
                    console.log(e.message)
                    ElMessage({
                        message: e.message,
                        type: 'error',
                    })
                }
            }
        },
        async beforeMount() {
            await this.fetchLidorubs()
            this.newHandBonus.bonusText = this.allBonusTexts[0]
            this.newHandBonus.bonusUserName = this.usersList[0]
        }
    }

</script>