<template>
    <h3>ОКК</h3>

    <el-form inline>
        <el-form-item label="Начало">
          <el-input v-model="gte" type="date" style="width: 200px"/>
        </el-form-item>
        <el-form-item>
            <el-button type="success" plain @click="fetchLeads">Применить</el-button>
        </el-form-item>
    </el-form>

    <!-- <p>При обновление сохранении данных лидов ставьте флажок к колонке "Проверен" тем лидам которые проверил иначе они перезапишутся и статус вернется к нецелевой неважно целевой он или нет</p> -->

    <el-button style="margin-bottom: 10px" plain type="warning" @click="isManualeShow = true">Открыть памятку</el-button>

    <p style="marign-top: 20px; margin-bottom: 20px;">Теперь если обновить значение статуса ОКК в прошлых датах то будет авто обновление зарплатной</p>
    <p style="color: gray; margin-bottom: 20px;">на получение ответа с сервера уйдет дольше времени !!!</p>

    <el-table :data="tableData" style="width: 100%">
        <el-table-column :width="100" prop="date" label="Дата"></el-table-column>
        <el-table-column :width="120" prop="phone" label="Телефон"></el-table-column>

        <el-table-column :width="170" label="Лидоруб">
            <template #default="{ row }">
                <FormItemSelect v-if="usersList" v-model="row.userName" :options="usersList" @change="(value) => handleUserNameChange(row, value)" />
            </template>
        </el-table-column>

        <el-table-column :width="100" label="Запись">
            <template #default="{ row }">
                <div class="buttons-container">
                    <el-button v-for="(audio, index) in row.audioArray.slice(0, 1)" :key="index"  class="audio-button" circle plain type="primary" @click="playAudio(audio)">
                        <el-icon>
                            <VideoPlay></VideoPlay>
                        </el-icon>
                    </el-button>
                    <el-button circle type="warning" plain @click="openAllAudio(row)">{{ row.audioArray.length }}</el-button>
                </div>
            </template>
        </el-table-column>

        <el-table-column :width="140" label="Уникальный ?">
            <template #default="{ row }">
                <span :style="{ color: row.isUniquePhone ? '' : 'red' }">{{ row.isUniquePhone ? 'уникальный' : 'повтор' }}</span>
            </template>
        </el-table-column>

        <el-table-column :width="140" label="ЗП за лид">
            <template #default="{ row }">
                <el-input v-model="row.leadSalaryPrice" type="number"></el-input>
            </template>
        </el-table-column>
        
        <el-table-column :width="150" label="Установить ОКК">
            <template #default="{ row }">
              <el-select v-model="row.statusOKK" placeholder="Выберите статус" style="width: 120px;">
                <el-option :label="'Целевой'" :value="true"></el-option>
                <el-option :label="'Нецелевой'" :value="false"></el-option>
              </el-select>
            </template>
        </el-table-column>
        
        <el-table-column :width="100" label="Коммент">
            <template #default="{ row }">
                <el-button @click="openModalToComment(row)">+</el-button>
                <el-tooltip popper-class="comment-tooltip" v-if="row.commentOKK" :width="100" effect="light" :content="row.commentOKK" placement="top">
                    ...
                </el-tooltip>
            </template>
        </el-table-column>

        <el-table-column prop="selfLeadName" :width="110" label="Сам перевел" />
        <el-table-column prop="broker" :width="140" label="Брокер"></el-table-column>

        <el-table-column prop="residenceStatus" :width="200" label="Статус">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <div v-if="!row.isEditResidence" class="custom-div" :style="{ 'background-color' : getTypeOfBadge(row.residenceStatus), flex: 1 }">
                  {{ row.residenceStatus }}
                </div>
                
                <el-select v-if="row.isEditResidence" v-model="row.residenceStatus" style="flex: 1;">
                  <el-option v-for="(status, idx) in allStatuses" :key="idx" :label="status" :value="status" />
                </el-select>
                
                <el-button :type="row.isEditResidence ? 'success' : 'warning'" plain @click="row.isEditResidence = !row.isEditResidence" style="flex-shrink: 0;">
                    <el-icon>
                        <Check v-if="row.isEditResidence"></Check>
                        <Edit v-if="!row.isEditResidence"></Edit>
                    </el-icon>
                </el-button>

              </div>
            </template>
        </el-table-column>

        <el-table-column :width="100" label="Проверен">
            <template #default="{ row }">
                <el-checkbox v-model="row.isEdited"></el-checkbox>
            </template>
        </el-table-column>

        <el-table-column :width="140" label="Изменить">
            <template #default="{ row }">
                <el-button circle plain type="primary" @click="openEditModal(row)">
                    <el-icon>
                        <Edit />
                    </el-icon>
                </el-button>
            </template>
        </el-table-column>

    </el-table>

    <el-button type="success" style="margin-top: 30px" @click="saveLeadsData">Сохранить данные</el-button>

    <div v-if="isAudioLoading && !showModalToAudio">
        <p>Идет загрузка Аудио</p>
    </div>

    <div v-if="currentAudioUrl && !showModalToAudio" style="margin-top: 20px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 8px; display: flex; align-items: center; gap: 20px;">
        <el-button :disabled="isAudioLoading" @click="togglePlay" type="primary" icon>
            <el-icon>
                <component :is="isPlaying ? 'VideoPlay' : 'VideoPause'" />
            </el-icon>
        </el-button>
        <el-slider :disabled="isAudioLoading" v-model="progress" :max="duration" @change="seek" style="flex: 1;" tooltip="hover" tooltip-format="{value}s"></el-slider>
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        <audio ref="audio" :src="currentAudioUrl"></audio>
    </div>

    <el-dialog title="Памятка дял ОКК" v-model="isManualeShow" width="400px">
        <p>сдесь можно менять статус ОКК и изменять юзера для определного лида в колонках "Лидоруб" и "Установить ОКК"</p>
        <strong>чтобы изменения вошли в силу и в будущем програмане перезаписала и не убрала изменения нужно поставить галочку для даного лида в колонке "Проверен"</strong>
    </el-dialog>


    <el-dialog title="Прослушать все аудио" v-model="showModalToAudio" width="700px">
        
        <div style="display: flex; flex-direction: column;">
            <div v-for="(audio, index) in allLeadAudioArray" style="display: flex; align-items: center">
                <p>Запись номер {{ index }}</p>
                <el-button style="margin-left: 20px;" :key="index"  class="audio-button" type="success" @click="playAudio(audio)">
                    <el-icon>
                        <VideoPlay></VideoPlay>
                    </el-icon>
                </el-button>
            </div>
        </div>

        <div v-if="isAudioLoading && showModalToAudio">
            <p>Идет загрузка Аудио</p>
        </div>

        <div v-if="currentAudioUrl" style="margin-top: 20px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 8px; display: flex; align-items: center; gap: 20px;">
            <el-button :disabled="isAudioLoading" @click="togglePlay" type="primary" icon>
                <el-icon>
                    <component :is="isPlaying ? 'VideoPlay' : 'VideoPause'" />
                </el-icon>
            </el-button>
            <el-slider :disabled="isAudioLoading" v-model="progress" :max="duration" @change="seek" style="flex: 1;" tooltip="hover" tooltip-format="{value}s"></el-slider>
            <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            <audio ref="audio" :src="currentAudioUrl"></audio>
        </div>

    </el-dialog>

    <el-dialog title="Изменение коментария" v-model="showModalToComment" width="700px">
        <el-form :model="isEditedLeadObject" label-width="150px" label-position="left">

            <el-form-item label="Комментарий">
                <el-input v-model="isEditedLeadObject.commentOKK"></el-input>
            </el-form-item>

            <el-button type="success" @click="setChanges">Оставить коментарий</el-button>
            <el-button type="danger" @click="isEditedLeadObject.commentOKK = '';setChanges()">Удалить коментарий</el-button>
        </el-form>
    </el-dialog>

    <el-dialog title="Редактирование лида" v-model="isEditLeadInfo" width="700px">
        <el-form :model="isEditedLeadObject" label-width="150px" label-position="left">
            <el-form-item label="Цена офера" prop="price">
                <el-input v-model="isEditedLeadObject.price" type="number" placeholder="Введите цену"></el-input>
            </el-form-item>

            <el-form-item label="ЗП за лид" prop="leadSalaryPrice">
                <el-input v-model="isEditedLeadObject.leadSalaryPrice" type="number" placeholder="ЗП за лид"></el-input>
            </el-form-item>
    
            <el-form-item label="Статус резиденции" prop="residenceStatus">
                <el-select v-model="isEditedLeadObject.residenceStatus" placeholder="Выберите статус">
                    <el-option v-for="(status, idx) in allStatuses" :key="idx" :label="status" :value="status" />
                </el-select>
            </el-form-item>
    
            <el-form-item label="Брокер" prop="broker">
                <!-- <el-input v-model="isEditedLeadObject.broker" placeholder="Введите имя брокера"></el-input> -->
                <FormItemSelect v-if="brokersList.length > 0" v-model="isEditedLeadObject.broker" :options="brokersList" valueKey="name" labelKey="name" />
            </el-form-item>

            <el-button type="success" @click="setChanges">Применить изменении</el-button>
        </el-form>
    </el-dialog>

</template>


<style>

.buttons-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
  
.audio-button {
    max-width: 45%;
    height: 30px;
}

.custom-div {
    width: 80px;
    text-align: center;
    font-size: 14px;
    text-align: center;
    color: white;
    padding-top: 3px;
    padding-bottom: 3px;
    margin-left: -10px;
}

.comment-tooltip {
    width: 400px;
}

</style>

<script>

    import { ElButton, ElSlider } from 'element-plus'
    import { VideoPlay, VideoPause, Edit, Check, Close } from '@element-plus/icons-vue'
    import { ElMessage } from 'element-plus';

    import FormItemSelect from '../components/FormItemSelect.vue'


    import axios from 'axios'
    import dayjs from 'dayjs'

    export default {
    components: {
        ElButton,
        ElSlider,
        VideoPlay,
        VideoPause,
        FormItemSelect,
        Edit,
        Check,
        Close
    },
    data() {
        return {
            tableData: [],
            gte: dayjs().format('YYYY-MM-DD'),
            currentAudioUrl: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            progress: 0,
            usersList: null,
            isManualeShow: false,
            isEditLeadInfo: false,
            isEditedLeadObject: null,
            allStatuses: ['hold', 'confirmed', 'refused', 'breaked', 'invalid', 'created'],
            showModalToComment: false,
            allLeadAudioArray: null,
            showModalToAudio: false,
            isAudioLoading: false,
        }
    },
    computed: {
        brokersList() {
            return this.$store.getters['getBrokersList']
        }
    },
    methods: {
        async fetchLeads() {
            const response = await this.$store.dispatch('getDataList', {
                col: 'api/leads/get',
                params: {
                    gte: dayjs(this.gte).format('YYYY-MM-DD'),
                    lte: dayjs(this.gte).format('YYYY-MM-DD')
                }
            })

            this.tableData = response.leads
        },
        setNewStatus(status, lead) {
            
        },
        handleUserNameChange(row, newUserName) {
            const newUserIdByNewUserName = this.usersList.find((user) => {
                return user.label === newUserName
            })._id

            row.user = newUserIdByNewUserName
        },
        openAllAudio(lead) {
            this.allLeadAudioArray = lead.audioArray
            this.showModalToAudio = true
        },
        openEditModal(lead) {
            this.isEditedLeadObject = lead
            this.isEditLeadInfo = true
        },
        openModalToComment(lead) {
            this.isEditedLeadObject = lead
            this.showModalToComment = true
        },
        async saveLeadsData() {

            const response = await this.$store.dispatch('createDataList', {
                col: "api/leads/upsert",
                data: {
                    leadsData: this.tableData,
                    date: this.gte
                }
            })

            ElMessage({
                message: 'Лиды успешно изменены',
                type: 'success',
            });
        },
        async setChanges() {
            try {
                const response = await this.$store.dispatch('createDataList', { 
                    col: 'api/leads/edit',
                    data: {
                        editedLead: this.isEditedLeadObject
                    }
                 })
                 ElMessage({
                    message: 'Лид успешно редактирвоаный',
                    type: 'success',
                });
                this.isEditLeadInfo = false
                this.showModalToComment = false
            } catch (e) {
                console.log(e.message)
                ElMessage({
                    message: `ошибка ${e.message} (((`,
                    type: 'error',
                });
            }
        },
        async fetchAllUsers() {
            try {
                const response = await this.$store.dispatch('getDataList', { col: 'api/users/getList' })
                this.usersList = response.data.map(user => ({
                    value: user.name,
                    label: user.name,
                    _id: user._id
                }));
            } catch (e) {
                console.log(e.message)
            }
        },
        getTypeOfBadge(status) {
            let type

            if (status === 'hold') {
                type = 'rgb(44, 157, 44)'
            } else if (status === 'created') {
                type = 'rgb(158, 158, 158)'
            } else if (status === 'invalid') {
                type = 'rgb(248, 104, 188)'
            } else if (status === 'breaked') {
                type = 'rgb(104, 200, 248)'
            } else if (status === 'confirmed') {
                type = 'rgb(253, 191, 76)'
            } else if (status === 'refused') {
                type = 'rgb(190, 116, 247)'
            }

            return type
        },
        async playAudio(audioUrl) {
            this.currentAudioUrl = audioUrl
            this.isAudioLoading = true
            this.currentTime = 0
            this.progress = 0
            this.duration = 0
            this.isPlaying = false

            const loadAudio = (audio) => {
                return new Promise((resolve) => {
                    audio.onloadedmetadata = () => {
                        this.duration = audio.duration
                        this.isAudioLoading = false
                        resolve()
                    }
                })
            }

            this.$nextTick(async () => {
                const audio = this.$refs.audio
                audio.src = this.currentAudioUrl
                audio.load()

                await loadAudio(audio)

                await audio.play()
                this.isPlaying = true

                audio.ontimeupdate = () => {
                    this.currentTime = audio.currentTime
                    this.progress = audio.currentTime
                }

                audio.onended = () => {
                    this.isPlaying = false
                }
            })
        },
        togglePlay() {
            const audio = this.$refs.audio
            if (!audio) return
            
            if (this.isPlaying) {
                audio.pause()
                this.isPlaying = false
            } else {
                audio.play()
                this.isPlaying = true
            }
        },
        seek() {
        const audio = this.$refs.audio
        if (audio) {
            audio.currentTime = this.progress
            if (!this.isPlaying) {
            audio.play()
            this.isPlaying = true
            }
        }
        },
        formatTime(seconds) {
            const min = Math.floor(seconds / 60)
            const sec = Math.floor(seconds % 60)
            return `${min}:${sec < 10 ? '0' + sec : sec}`
        },
    },
    async beforeMount() {
        await this.fetchLeads()
        await this.fetchAllUsers()
    }
    }
</script>