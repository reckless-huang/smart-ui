import { login, ldapLogin, logout, getInfo, refreshtoken } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import storage from '@/utils/storage'

const state = {
  userid: '',
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  permissions: [],
  permisaction: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERID: (state, userid) => {
    state.userid = userid
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    if (avatar.indexOf('http') !== -1) {
      state.avatar = avatar
    } else {
      state.avatar = process.env.VUE_APP_BASE_API + avatar
    }
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permisaction) => {
    state.permisaction = permisaction
  },
  SET_DEPTID: (state, deptId) => {
    state.deptId = deptId
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone
  },
  SET_SEX: (state, sex) => {
    state.sex = sex
  },
  SET_EMAIL: (state, email) => {
    state.email = email
  },
  SET_POSTID: (state, postId) => {
    state.postId = postId
  },
  SET_PROFILECOMPLAETE: (state, profileComplete) => {
    state.profileComplete = profileComplete
  }
}

const actions = {

  // user login
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  ldapLogin({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      ldapLogin(userInfo).then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        if (!response || !response.data) {
          commit('SET_TOKEN', '')
          removeToken()
          resolve()
        }
        const { roles, name, avatar,deptId,phone,sex,email,postId, introduction, permissions,userId,profileComplete } = response.data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_PERMISSIONS', permissions)
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_USERID', userId)
        commit('SET_DEPTID', deptId)
        commit('SET_PHONE', phone)
        commit('SET_SEX', sex)
        commit('SET_EMAIL', email)
        commit('SET_POSTID', postId)
        commit('SET_PROFILECOMPLAETE', profileComplete)

        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 退出系统
  LogOut({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
        storage.clear()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 刷新token
  refreshToken({ commit, state }) {
    return new Promise((resolve, reject) => {
      refreshtoken({ token: state.token }).then(response => {
        const { token } = response
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
