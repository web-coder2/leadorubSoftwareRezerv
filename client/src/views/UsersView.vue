<template>
    <h3>Пользователи</h3>

    <el-button plain type="warning" @click="visibleModalCreateUser = true">Создать пользователя</el-button>

    <el-table :data="usersArray" style="width: 100%; margin-top: 20px;">

        <el-table-column prop="email" label="Логин">
            <template #default="{ row }">
                <div class="login-container">
                    <!-- сдесь apiBase для того чтобы если прод то дргуой или локалхост то тоже другой базоый АйПи будет -->
                    <img v-if="row.avatar" class="user-avatar" :src="`${apiBase}public/avatars/${row.avatar}`">
                    <span>{{ row.email }}</span>
                </div>
            </template>
        </el-table-column>

        <el-table-column prop="name" label="Имя"></el-table-column>
        <el-table-column prop="rankName" label="Ранк"></el-table-column>
        <el-table-column prop="password" label="Пароль"></el-table-column>
        <el-table-column label="Удалить">
            <template #default="{ row }">
                <el-button type="danger" plain @click="deleteUser(row._id)">Удалить</el-button>
            </template>
        </el-table-column>
        <el-table-column label="Редактировать">
            <template #default="{ row }">
                <el-button type="success" plain @click="editUser(row)">Редактировать</el-button>
            </template>
        </el-table-column>
        <el-table-column label="Загрузить аватар">
            <template #default="{ row }">
                <el-button type="primary" plain @click="openModalToAvatar(row)">Загрузить</el-button>
            </template>
        </el-table-column>
    </el-table>


    <el-dialog title="Создание пользователя" v-model="visibleModalCreateUser" width="500px">
        <el-form :model="newCreatedUser" label-width="120px">
            <el-form-item label="Логин" prop="email">
                <el-input v-model="newCreatedUser.email"></el-input>
            </el-form-item>
            <el-form-item label="Имя" prop="name">
                <el-input v-model="newCreatedUser.name"></el-input>
            </el-form-item>
            <el-form-item label="Ранк" prop="rankName">
                <el-input v-model="newCreatedUser.rankName"></el-input>
            </el-form-item>
            <el-form-item label="Пароль" prop="password">
                <el-input v-model="newCreatedUser.password"></el-input>
            </el-form-item>
            <el-form-item label="skorozvonId" prop="skorozvonId">
                <el-input type="number" v-model="newCreatedUser.skorozvonId"></el-input>
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button @click="visibleModalCreateUser = false">Отмена</el-button>
            <el-button type="primary" @click="createNewUser">Сохранить</el-button>
        </div>
    </el-dialog>


    <el-dialog title="Редактировать пользователя" v-model="isShowModalEditUser" width="500px">
      <el-form :model="editedUser" label-width="120px">
        <el-form-item label="Логин" prop="email">
          <el-input v-model="editedUser.email"></el-input>
        </el-form-item>
        <el-form-item label="Имя" prop="name">
          <el-input v-model="editedUser.name"></el-input>
        </el-form-item>
        <el-form-item label="Ранк" prop="rankName">
          <el-input v-model="editedUser.rankName"></el-input>
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
          <el-input v-model="editedUser.password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowModalEditUser = false">Отмена</el-button>
        <el-button type="primary" @click="saveUser">Сохранить</el-button>
      </div>
    </el-dialog>

    <el-dialog v-if="visibleModalToAvatar" :title="`Загрузка аватара для юзера ${userForAvatar.name}`" v-model="visibleModalToAvatar" width="800px">
        <el-form ref="form">
            <el-form-item label="Выберите аватар">
                <el-upload class="avatar-uploader" :show-file-list="false" :on-change="handleFileChange" accept="image/*">
                    <el-button slot="trigger" size="small" type="primary">Выбрать файл</el-button>
                </el-upload>
            </el-form-item>
            <div v-if="avatarUrl" class="avatar-preview">
                <img :src="avatarUrl" alt="Preview" />
            </div>
            <el-form-item>
                <el-button :disabled="!avatarFile" type="primary" @click="uploadAvatar">Загрузить</el-button>
                <el-button @click="visibleModalToAvatar = false">Отмена</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

</template>

<style>

.avatar-preview {
  margin-top: 20px;
  margin-bottom: 20px;
}

.avatar-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
}

.user-avatar {
    width: 30px;
    height: 30px;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 10px;
}

.login-container {
    display: flex;
    align-items: center;
}

</style>

<script>

    import axios from 'axios';
    import { ElMessage } from 'element-plus';

    export default {
        data() {
            return {
                usersArray: [],
                editedUser: null,
                isShowModalEditUser: false,
                visibleModalCreateUser: false,
                newCreatedUser: {
                    email: "",
                    name: "",
                    password: "",
                    skorozvonId: 0,
                    rankName: "leadorub"
                },
                visibleModalToAvatar: false,
                userForAvatar: null,
                avatarFile: null,
                avatarUrl: '',
                apiBase: null
            }
        },
        async beforeMount() {
            this.apiBase = this.$store.getters['getApiBaseURL']
            await this.getUsersList()
        },
        methods: {
            async getUsersList() {
                console.log('this:', this);
                console.log('this.$store:', this.$store);

                const response = await this.$store.dispatch('getDataList', {
                    col: 'api/users/getList',
                });

                this.usersArray = response.data;
            },
            async createNewUser() {
                try {
                    const response = await this.$store.dispatch('createDataList', {
                        col: 'api/users/create',
                        data: {
                            userObject: this.newCreatedUser
                        }
                    });

                    this.newCreatedUser = {
                        email: "",
                        name: "",
                        password: "",
                        skorozvonId: 0,
                        rankName: "leadorub"
                    },

                    ElMessage({
                        message: 'Пользователь успешно создан',
                        type: 'success',
                    });

                } catch (e) {
                    console.log(e.message)
                    ElMessage({
                        message: `ошибка при создание юзера ${e.message}`,
                        type: 'error',
                    });
                }
            },  
            async deleteUser(id) {
                try {
                    const response = await this.$store.dispatch('createDataList', {
                        col: 'api/users/delete',
                        data: {
                            id: id
                        }
                    })
                    ElMessage({
                        message: 'Пользователь успешно удален',
                        type: 'success',
                    });
                    await this.getUsersList()
                } catch (e) {
                    console.log(e.message)
                }
            },
            editUser(userObject) {
                this.editedUser = userObject
                this.isShowModalEditUser = true
            },
            openModalToAvatar(userObject) {
                this.userForAvatar = userObject
                this.visibleModalToAvatar = true
            },
            handleFileChange(file, fileList) {
                if (file.raw) {
                    this.avatarFile = file.raw
                    const reader = new FileReader()
                    reader.onload = e => {
                        this.avatarUrl = e.target.result
                    }
                    reader.readAsDataURL(file.raw)
                }
            },
            async uploadAvatar() {
                if (!this.avatarFile) {
                    alert('Пожалуйста, выберите файл')
                    return
                }
                
                try {
                    const formData = new FormData();
                    formData.append('avatar', this.avatarFile)
                    formData.append('userId', this.userForAvatar._id)

                    await this.$store.dispatch('createDataList', {
                        col: 'api/users/upload-avatar',
                        data: formData
                    })

                    this.visibleModalToAvatar = false

                    ElMessage({
                        message: 'Аватар успешно обновлен',
                        type: 'success',
                    })

                    await this.getUsersList()
                
                } catch (e) {
                    console.log(e.message)

                    this.visibleModalToAvatar = false

                    ElMessage({
                        message: `ошибка обновления аватара ${e.message}`,
                        type: 'success',
                    })
                }
            },
            async saveUser() {
                const result = await this.$store.dispatch('createDataList', {
                    col: 'api/users/edit',
                    data: {
                        editUser: this.editedUser
                    }
                })
                this.isShowModalEditUser = false

                ElMessage({
                    message: 'Пользователь успешно обновлен',
                    type: 'success',
                });
            }
        }
    }

</script>