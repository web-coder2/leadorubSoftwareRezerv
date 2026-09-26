<template>

    <el-button type="warning" plain @click="showFilter =! showFilter">{{ showFilter ? 'скрыть' : 'показать' }} фильтр</el-button>

    <el-form style="margin-top: 20px;" v-if="showFilter">
        <el-form-item>
            <el-date-picker style="width: 250px;" v-model="filter.gte"></el-date-picker>
        </el-form-item>

        <el-form-item v-if="rankName !== 'admin'">
            <el-date-picker style="width: 250px;" v-model="filter.lte"></el-date-picker>
        </el-form-item>

        <el-form-item>
            <el-select placeholder="статус резиденции" v-model="filter.statuses" filterable :multiple="true" style="width: 250px;">
                <el-option v-for="item in statusList" :key="item" :label="item" :value="item"/>
            </el-select>
        </el-form-item>

        <el-form-item>
            <el-select placeholder="лидоруб" v-model="filter.users" filterable :multiple="true" style="width: 250px;">
                <el-option v-for="item in usersList" :key="item.label" :label="item.label" :value="item.value"/>
            </el-select>
        </el-form-item>

        <el-form-item>
            <el-select placeholder="уникальность" v-model="filter.isUnique" style="width: 250px;">
                <el-option label="уникальные" :value="true"></el-option>
                <el-option label="повторные" :value="false"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item>
            <el-select placeholder="статус ОКК" v-model="filter.statusOKK" style="width: 250px;">
                <el-option label="Целевой" :value="true"></el-option>
                <el-option label="Нецелевой" :value="false"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item>
            <el-button @click="fetchLeads" type="success" plain>Искать</el-button>
        </el-form-item>

    </el-form>



    <el-table style="margin-top: 30px;" :data="leadsList">
        <el-table-column label="Телефон" prop="phone" :width="120">
            <template #default="{ row }">
                <span>{{ renderPhoneNumber(row.phone) }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Дата" prop="date" :width="120"></el-table-column>
        <el-table-column label="Лидоруб" :width="150">
            <template #default="{ row }">
                <el-select v-if="rankName === 'admin'" v-model="row.userName" filterable>
                    <el-option v-for="item in usersList" :key="item.label" :label="item.label" :value="item.value"/>
                </el-select>
                <span v-else>{{ row.userName }}</span>
            </template>
        </el-table-column>
        <el-table-column v-if="rankName === 'admin'" label="Записи MP3" :width="150">
            <template #default="{ row }">
                <el-button @click="toggleDialogModalVisible('audio', row)" plain circle :type="row.audioArray.length > 0 ? 'success' : 'danger'">{{ row.audioArray.length }}</el-button>
            </template>
        </el-table-column>
        <el-table-column label="Статус ОКК" :width="150">
            <template #default="{ row }">
                <el-select v-if="rankName === 'admin'" v-model="row.statusOKK" filterable>
                    <el-option label="Целевой" :value="true"></el-option>
                    <el-option label="Нецелевой" :value="false"></el-option>
                </el-select>
                <span v-else>{{ row.statusOKK ? 'Целевой' : 'Нецелевой' }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Коментарий" :width="120">
            <template #default="{ row }">
                <el-button @click="toggleDialogModalVisible('comment', row)" v-if="rankName === 'admin'">+</el-button>
                <!-- <span v-else>{{ row.commentOKK }}</span> -->
                <el-tooltip effect="light" v-if="row.commentOKK.length > 0" :content="row.commentOKK">
                    ...
                </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column label="Кто перевел" prop="selfLeadName" :width="150"></el-table-column>
        <el-table-column label="Брокер" :width="150">
            <template #default="{ row }">
                <el-select v-if="rankName === 'admin'" v-model="row.broker">
                    <el-option v-for="(broker, index) in brokersList" :value="broker.name" :label="broker.name"></el-option>
                </el-select>
                <span v-else>{{ row.broker }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Уникальность" prop="isUniquePhone" :width="150">
            <template #default="{ row }">
                <el-tag :type="row.isUniquePhone ? 'success' : 'danger'">{{ row.isUniquePhone ? 'Уникальный' : 'Был повтор' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Повторы" prop="lastPhoneCalled" :width="150">
            <template #default="{ row }">
                <el-tag v-if="row.lastPhoneCalled !== 'first'">{{ row.lastPhoneCalled }}</el-tag>
                <span v-else>Первый лид</span>
            </template>
        </el-table-column>
        <el-table-column label="Цена лида" :width="100">
            <template #default="{ row }">
                <el-input v-if="rankName === 'admin'" v-model="row.leadSalaryPrice" type="number"></el-input>
                <el-tag v-else :type="getTypeByPrice(row.leadSalaryPrice)">{{ row.leadSalaryPrice }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Офер лида" :width="150">
            <template #default="{ row }">
                <el-input v-if="rankName === 'admin'" type="number" v-model="row.price"></el-input>
                <span v-else>{{ row.price }}</span>
            </template>
        </el-table-column>
        <el-table-column label="Статус лида" :width="150">
            <template #default="{ row }">
                <el-select v-if="rankName === 'admin'" v-model="row.residenceStatus" filterable>
                    <el-option v-for="item in statusList" :key="item" :label="item" :value="item"/>
                </el-select>
                <el-tag v-else :type="getResidenceStatusType(row.residenceStatus)">{{ row.residenceStatus }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column v-if="rankName === 'admin'" label="Проверено" :width="110">
            <template #default="{ row }">
                <el-checkbox class="check-boxer" v-model="row.isChecked"></el-checkbox>
            </template>
        </el-table-column>
        <el-table-column label="Офферы" :width="100">
            <template #default="{ row }">
                <el-button @click="toggleDialogModalVisible('offers', row)" circle plain :type="row.offersList.length > 0 ? 'success' : 'warning'">{{ row.offersList.length }}</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-button v-if="rankName === 'admin'" @click="saveLeadsData" style="margin-top: 20px;" type="success" plain>обновить лиды</el-button>

    <el-dialog v-model="dialogVisibles.dialogComment" title="Редактирование коментария ОКК" :width="400">
        <el-input v-model="editedLead.commentOKK"></el-input>
        
        <div style="margin-top: 20px; display: flex; justify-content: space-between;">
            <el-button @click="saveChangesToLead" type="success" plain>Сохранить</el-button>
            <el-button @click="deleteComment" type="danger" plain>Удалить</el-button>
        </div>
    </el-dialog>

    <el-dialog title="Прослушать аудио лидорубов" v-model="dialogVisibles.dialogAudio" :width="400">
        
        <div>
            <div v-for="(audio, index) in editedLead.audioArray" style="display: flex; align-items: center">
                <el-button circle plain type="primary" style="margin-top: 10px;" @click="playAudio(audio)">{{ index }}</el-button>
            </div>
        </div>

        <div v-if="audio.isLoading">
            <p>Идет загрузка Аудио</p>
        </div>

        <div v-if="audio.currentURL" style="margin-top: 20px; padding: 10px; border: 1px solid #dcdfe6; border-radius: 8px; display: flex; align-items: center; gap: 20px;">
            <el-button :disabled="audio.isLoading" @click="togglePlay" type="success" circle>
                <el-icon>
                    <component :is="!audio.isPlaying ? 'VideoPlay' : 'VideoPause'" />
                </el-icon>
            </el-button>
            <el-slider :disabled="audio.isLoading" v-model="audio.progress" :max="audio.duration" @change="seek" style="flex: 1;" tooltip="hover" tooltip-format="{value}s"></el-slider>
            <span>{{ formatTime(audio.progress) }} / {{ formatTime(audio.duration) }}</span>
            <audio ref="audio" :src="audio.currentURL"></audio>
        </div>

    </el-dialog>

    <el-dialog v-model="dialogVisibles.dialogOffers" title="Офферы лида" :width="400">
        <el-switch :disabled="rankName !== 'admin'" v-model="isModalOffersMode" active-text="Редактировать" inactive-text="Прочитать"></el-switch>

        <div style="margin-top: 20px;">
            <el-card style="margin-bottom: 20px;" v-for="(offer, idx) in editedLead.offersList">
                <div>
                    <el-input v-if="isModalOffersMode" v-model="offer.offerName"></el-input>
                    <p v-else>имя оффера: <strong>{{ offer.offerName }}</strong></p>
                </div>
                
                <div style="margin-top: 10px;">
                    <el-select v-if="isModalOffersMode" v-model="offer.broker">
                        <el-option v-for="(broker, idx) in brokersList" :value="broker.name" :label="broker.name"></el-option>
                    </el-select>
                    <p v-else>брокер лида: <strong>{{ offer.broker }}</strong></p>
                </div>

                <div style="margin-top: 10px;">
                    <el-input type="number" v-if="isModalOffersMode" v-model.number="offer.price"></el-input>
                    <p v-else>оффер лида: <strong>{{ offer.price }}</strong></p>
                </div>

                <div style="margin-top: 10px;">
                    <el-select v-if="isModalOffersMode" v-model="offer.status">
                        <el-option v-for="(status, index) in statusList" :value="status" :label="status"></el-option>
                    </el-select>
                    <p v-else>статус: <el-tag :type="getResidenceStatusType(offer.status)">{{ offer.status }}</el-tag></p>
                </div>

                <div v-if="isModalOffersMode" style="margin-top: 10px;">
                    <el-button @click="deleteSomeOfferFromEditedLead(idx)" type="danger" circle plain>
                        <el-icon>
                            <Delete></Delete>
                        </el-icon>
                    </el-button>
                </div>
            </el-card>

            <div v-if="isModalOffersMode" style="display: flex; justify-content: space-between;">
                <el-button @click="addNewOfferToEditedLead" type="primary" circle plain>
                    <el-icon>
                        <Plus></Plus>
                    </el-icon>
                </el-button>

                <el-button @click="saveChangesToLead" type="success" plain>Сохранить</el-button>
            </div>
        </div>


    </el-dialog>

</template>

<style>

.check-boxer {
    transform: scale(2);
}

</style>

<script>

    import dayjs from 'dayjs';
    import axios from 'axios';

    import FormItemSelect from '../components/FormItemSelect.vue'
    import { ElMessage } from 'element-plus';
    import { Delete, Plus, VideoPlay, VideoPause } from '@element-plus/icons-vue';

    export default {
        data() {
            return {
                userObject: null,
                rankName: null,
                showFilter: false,
                filter: {
                    gte: dayjs(new Date).format('YYYY-MM-DD'),
                    lte: dayjs(new Date).format('YYYY-MM-DD'),
                    statuses: [],
                    statusOKK: null,
                    isUnique: null,
                    users: null
                },
                statusList: ['hold', 'confirmed', 'refused', 'invalid', 'breaked', 'created'],
                usersList: [],
                leadsList: [],
                dialogVisibles: {
                    dialogComment: false,
                    dialogOffers: false,
                    dialogAudio: false
                },
                editedLead: null,
                isModalOffersMode: false,
                audio: {
                    currentURL: null,
                    isLoading: false,
                    currentTime: 0,
                    progress: 0,
                    duration: 0,
                    isPlaying: false
                }
            }
        },
        components: {
            FormItemSelect,
            Delete,
            Plus,
            VideoPlay,
            VideoPause
        },
        computed: {
            brokersList() {
                return this.$store.getters['getBrokersList']
            }
        },
        methods: {
            async fetchLeads() {
                try {
                    const response = await this.$store.dispatch('getDataList', {
                        col: 'api/leads/get',
                        params: {...this.filter}
                    })
                    this.leadsList = response.leads
                } catch (e) {
                    console.log(e.message)
                    ElMessage({
                        message: 'ошибка поиска лидов',
                        type: 'error',
                    })
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
                    ElMessage({
                        message: 'ошибка поиска лидорубов',
                        type: 'error',
                    })
                }
            },
            getResidenceStatusType(status) {
                const statusMap = {
                    hold: 'success',
                    confirmed: 'warning',
                    refused: 'danger',
                    invalid: 'danger',
                    breaked: 'primary',
                    created: 'default'
                }
                return statusMap[status] || 'default'
            },
            getTypeByPrice(price) {
                if (price === 250) {
                    return 'success'
                } else if (price === 100) {
                    return 'warning'
                } else if (price === 0) {
                    return 'danger'
                } else {
                    return 'default'
                }
            },
            toggleDialogModalVisible(mode, leadObj) {
                if (mode === 'comment') {
                    this.dialogVisibles.dialogComment = true
                } else if (mode === 'offers') {
                    this.dialogVisibles.dialogOffers = true
                } else if (mode === 'audio') {
                    this.dialogVisibles.dialogAudio = true
                }
                this.editedLead = leadObj
            },
            addNewOfferToEditedLead() {
                this.editedLead.offersList.push({
                    offerName: 'ЖК Альфа',
                    broker: 'Володя Банкир',
                    price: 1500,
                    status: 'hold'
                })
            },
            renderPhoneNumber(phone) {
                let splicedPhone = phone.slice(-6)
                let renderedPhone = this.rankName === 'admin' ? phone : splicedPhone
                return renderedPhone
            },
            deleteSomeOfferFromEditedLead(offerIndex) {
                this.editedLead.offersList.splice(offerIndex, 1)
            },
            async deleteComment() {
                this.editedLead.commentOKK = ''
                await this.saveChangesToLead()
            },
            async saveChangesToLead() {
                try {
                    const response = await this.$store.dispatch('createDataList', { 
                        col: 'api/leads/edit',
                        data: {
                            editedLead: this.editedLead
                        }
                    })
                    ElMessage({
                        message: 'лид успешно обновлен',
                        type: 'success',
                    })
                    this.dialogVisibles.dialogComment = false
                    this.dialogVisibles.dialogOffers = false
                } catch (e) {
                    console.log(e.message)
                    ElMessage({
                        message: `ошибка обновления лида ${e.message}`,
                        type: 'error',
                    })
                }
            },
            async saveLeadsData() {
                try {
                    const response = await this.$store.dispatch('createDataList', {
                        col: "api/leads/upsert",
                        data: {
                            leadsData: this.leadsList,
                            date: this.filter.gte
                        }
                    })

                    ElMessage({
                        message: 'Лиды успешно изменены',
                        type: 'success',
                    })
                } catch (e) {
                    ElMessage({
                        message: 'Ошибка обновления лидов',
                        type: 'error',
                    })
                }
            },
            async playAudio(audioUrl) {
                this.audio.currentURL = audioUrl
                this.audio.isLoading = true
                this.audio.currentTime = 0
                this.audio.progress = 0
                this.audio.duration = 0
                this.audio.isPlaying = false

                const loadAudio = (audio) => {
                    return new Promise((resolve) => {
                        audio.onloadedmetadata = () => {
                            this.audio.duration = audio.duration
                            this.audio.isLoading = false
                            resolve()
                        }
                    })
                }

                this.$nextTick(async () => {
                    const audio = this.$refs.audio
                    audio.src = this.audio.currentURL
                    audio.load()

                    await loadAudio(audio)

                    await audio.play()
                    this.audio.isPlaying = true

                    audio.ontimeupdate = () => {
                        this.audio.currentTime = audio.currentTime
                        this.audio.progress = audio.currentTime
                    }

                    audio.onended = () => {
                        this.audio.isPlaying = false
                    }
                })
            },
            togglePlay() {
                const audio = this.$refs.audio
                if (!audio) return
                
                if (this.audio.isPlaying) {
                    audio.pause()
                    this.audio.isPlaying = false
                } else {
                    audio.play()
                    this.audio.isPlaying = true
                }
            },
            seek() {
                const audio = this.$refs.audio
                if (audio) {
                    audio.currentTime = this.audio.progress
                    if (!this.audio.isPlaying) {
                        audio.play()
                        this.audio.isPlaying = true
                    }
                }
            },
            formatTime(seconds) {
                const min = Math.floor(seconds / 60)
                const sec = Math.floor(seconds % 60)
                return `${min}:${sec < 10 ? '0' + sec : sec}`
            }
        },
        watch: {
            'dialogVisibles.dialogAudio'(newVal) {
                if (!newVal) {
                    const audio = this.$refs.audio
                    if (audio && !audio.paused) {
                        audio.pause()
                    }
                    this.audio =  {
                        currentURL: null,
                        isLoading: false,
                        currentTime: 0,
                        progress: 0,
                        duration: 0,
                        isPlaying: false
                    }
                }
            }
        },
        async beforeMount() {
            await this.fetchAllUsers()
            await this.fetchLeads()

            this.userObject = this.$store.getters['getUserObject']
            this.rankName = this.userObject?.rankName ?? null
        }
    }

</script>