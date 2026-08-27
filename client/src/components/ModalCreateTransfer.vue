<template>

    <el-button type="success" @click="openModalShow">Создать лид</el-button>



    <el-dialog title="Добавить лид в БД" v-model="isShowModal" width="500px">

        <p>Если в поле "Лидоруб" будет пусто или не ваше имя то впишите его правлиьно</p>

        <el-form :model="transferObject" label-width="120px">
            <!-- <el-form-item label="Лидоруб" prop="userName">
                <el-input v-model="transferObject.userName"></el-input>
            </el-form-item> -->
            <el-form-item label="Лидоруб" prop="userName">
                <FormItemSelect v-if="usersList.length > 0" v-model="transferObject.userName" :options="usersList" />
            </el-form-item>
            <el-form-item label="Дата" prop="phone">
                <el-input v-model="transferObject.date" type="date"></el-input>
            </el-form-item>
            <el-form-item label="Телефон" prop="phone">
                <el-input v-model="transferObject.phone"></el-input>
            </el-form-item>
            <!-- <el-form-item label="Клиент" prop="client">
                <el-input v-model="transferObject.client"></el-input>
            </el-form-item>
            <el-form-item label="Описание" prop="description">
                <el-input v-model="transferObject.description"></el-input>
            </el-form-item> -->
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="isShowModal = false">Отмена</el-button>
          <el-button type="primary" @click="saveTransfer">Сохранить</el-button>
        </div>

    </el-dialog>

</template>

<script>

    import dayjs from 'dayjs'

    import { ElMessage } from 'element-plus';

    import FormItemSelect from './FormItemSelect.vue';

    export default {
        data() {
            return {
                isShowModal: false,
                transferObject: {
                    date: dayjs().format('YYYY-MM-DD'),
                    userName: this.userName,
                    phone: '',
                    // client: '',
                    // description: ''
                    broker: '',
                    price: 0,
                    residenceStatus: 'created',
                    statusOKK: false,
                    selfLead: 'Ручной',
                    countHold: 0,
                    isEdited: true,
                },
                usersList: [],
            }
        },
        components: {
            FormItemSelect
        },  
        props: {
            userName: {
                type: String,
                required: true
            }
        },
        methods: {
            openModalShow() {
                this.isShowModal = true
            },
            async saveTransfer() {
                if (!this.transferObject.userName) {
                    ElMessage({
                        message: 'Пожалуйста, выберите лидоруба',
                        type: 'warning',
                    });
                    return; 
                }

                try {
                    this.transferObject.date = dayjs(this.transferObject.date).format('YYYY-MM-DD');

                    const response = await this.$store.dispatch('createDataList', {
                        col: "api/leads/create",
                        data: {
                            leadObject: this.transferObject
                        }
                    });

                    this.isShowModal = false;

                    ElMessage({
                        message: 'Трансфер успешно добавлен в БД',
                        type: 'success',
                    });
                } catch (e) {
                    console.log(e.message);

                    ElMessage({
                        message: 'Ошибка при добавлении трансфера',
                        type: 'error',
                    });
                }
            },
            async fetchAllUsers() {
                try {
                    const response = await this.$store.dispatch('getDataList', { col: 'api/users/getList' })
                    this.usersList = response.data.map(user => ({
                        value: user.name,
                        label: user.name
                    }));
                } catch (e) {
                    console.log(e.message)
                }
            }
        },
        async beforeMount() {
            await this.fetchAllUsers()
        }
    }

</script>