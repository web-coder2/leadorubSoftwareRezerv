import { createStore } from 'vuex'
import axios from 'axios'

const store = createStore({
  state: {
    apiBaseURL: 'http://localhost:3000/',
    // apiBaseURL: 'http://31.130.151.240:3000/',
    userObject: null,
    brokersList: [],
  },
  getters: {
    getApiBaseURL: (state) => state.apiBaseURL,
    getUserObject: (state) => state.userObject,
    // отдать знаечние на фронт в компонент
    getBrokersList: (state) => state.brokersList,
  },
  mutations: {
    setApiBaseURL(state, url) {
      state.apiBaseURL = url
    },
    setUserObject(state, userObject) {
      state.userObject = userObject
      // сохраняем в localStorage
      if (userObject) {
        localStorage.setItem('userObject', JSON.stringify(userObject))
      } else {
        localStorage.removeItem('userObject')
      }
    },
    clearUserObject(state) {
      state.userObject = null
      localStorage.removeItem('userObject')
    },
    // мутация которая изменяет знаечние в store переменую
    setBrokersList(state, brokers) {
      state.brokersList = brokers
    }
  },
  actions: {
    // GET запрос
    async getDataList({ state }, { col, params }) {
      try {
        const response = await axios.get(`${state.apiBaseURL}${col}`, { params })
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    // POST запрос
    async createDataList({ state }, { col, data }) {
      try {
        const response = await axios.post(`${state.apiBaseURL}${col}`, data)
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    // PUT запрос
    async updateDataList({ state }, { col, data }) {
      try {
        const response = await axios.put(`${state.apiBaseURL}${col}`, data)
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    // DELETE запрос
    async deleteDataList({ state }, { col, data }) {
      try {
        const response = await axios.delete(`${state.apiBaseURL}${col}`, { data })
        return response.data
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    // вызов функции для получения данных
    async getBrokersList({ commit, state }) {
      try {
        
        const response = await axios.get(`${state.apiBaseURL}api/residence/brokersList`)
        let brokersList = response.data.brokers

        console.log(response)

        // вызов той самой мутации чтобы в нее передать маисв новое занчение и присвоить его в store 
        // потом в геттере отдаст
        commit('setBrokersList', brokersList)


      } catch (e) {
        console.log(e.message)
      }
    }
  },
})


// TODO: здесь можно сделат ьчтобы при ините фронтенда приложения в vuex сразу выызвались какие то экшены (и не только)

store.dispatch('getBrokersList')

// Инициализация userObject из localStorage при старте
const storedUser = localStorage.getItem('userObject')
if (storedUser) {
  store.commit('setUserObject', JSON.parse(storedUser))
}

export default store