<template>
  <div :data-clazz="model.clazz">
    <div class="panelTitle">{{ i18n['handleNode'] }}</div>
    <div class="panelBody">
      <DefaultDetail :model="model" :on-change="onChange" :read-only="readOnly" />
      <div class="panelRow">
        <div><span style="color: red">*</span> {{ i18n['handleNode.assignType'] }}：</div>
        <el-select
          size="small"
          style="width:90%; font-size: 12px"
          :placeholder="i18n['handleNode.assignType.placeholder']"
          :value="model.assignType"
          :disabled="readOnly"
          @change="(e) => { onChange('assignValue', []); onChange('assignType', e); assignmentType() }"
        >
          <el-option key="person" value="person" :label="i18n['handleNode.assignType.person']" />
          <el-option key="role" value="role" :label="i18n['userTask.assignType.role']" />
          <el-option key="department" value="department" :label="i18n['handleNode.assignType.department']" />
          <el-option key="variable" value="variable" :label="i18n['handleNode.assignType.variable']" />
        </el-select>
      </div>
      <div v-if="model.assignType === 'person'" class="panelRow">
        <div><span style="color: red">*</span> {{ i18n['handleNode.assignType.person.title'] }}：</div>
        <el-select
          size="small"
          style="width:90%; font-size:12px"
          :placeholder="i18n['handleNode.assignType.person.placeholder']"
          :disabled="readOnly"
          :value="model.assignValue"
          :multiple="true"
          :filterable="true"
          @change="(e) => { onChange('assignValue', e); getPersons(e) }"
        >
          <el-option v-for="user in users" :key="user.id" :label="user.name===''?user.name:user.name" :value="user.id" />
        </el-select>
      </div>
      <div v-else-if="model.assignType === 'role'" class="panelRow">
        <div><span style="color: red">*</span> {{ i18n['userTask.assignType.role.title'] }}：</div>
        <el-select
          v-model.number="model.assignValue"
          size="small"
          style="width:90%; font-size:12px"
          :placeholder="i18n['userTask.assignType.role.placeholder']"
          :disabled="readOnly"
          :multiple="true"
          @change="(e) => { onChange('assignValue', e); getPersons(e) }"
        >
          <el-option v-for="(item, index) in roles" :key="index" :label="item.roleName" :value="item.roleId" />
        </el-select>
      </div>
      <div v-else-if="model.assignType === 'department'" class="panelRow">
        <div><span style="color: red">*</span> {{ i18n['userTask.assignType.department.title'] }}：</div>
        <el-select
          size="small"
          style="width:90%; font-size:12px"
          :placeholder="i18n['userTask.assignType.department.placeholder']"
          :value="model.assignValue"
          :disabled="readOnly"
          :multiple="true"
          :filterable="true"
          @change="(e) => { onChange('assignValue', e); getPersons(e) }"
        >
          <el-option v-for="department in departments" :key="department.deptId" :label="department.deptName" :value="department.deptId" />
        </el-select>
      </div>
      <div v-else-if="model.assignType === 'variable'" class="panelRow">
        <div><span style="color: red">*</span> {{ i18n['handleNode.assignType.variable.title'] }}：</div>
        <el-select
          v-model.number="model.assignValue"
          size="small"
          style="width:90%; font-size:12px"
          :placeholder="i18n['handleNode.assignType.variable.placeholder']"
          :disabled="readOnly"
          :multiple="true"
          :filterable="true"
          @change="(e) => { onChange('assignValue', e); getPersons(e) }"
        >
          <el-option v-for="(item, index) in variableOptions" :key="index" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <!--选择任务-->
      <div class="panelRow">
        <div>之后任务：</div>
        <el-select
          size="small"
          style="width:90%; font-size:12px"
          placeholder="选择任务"
          :disabled="readOnly"
          :value="model.task"
          :multiple="true"
          :filterable="true"
          @change="(e) => onChange('task', e)"
        >
          <el-option v-for="(taskValue, taskIndex) in tasks" :key="taskIndex" :label="taskValue.name" :value="taskValue.name" />
        </el-select>
      </div>
      <!--选择执行节点-->
      <div class="panelRow" v-if="model.task && model.task.length > 0">
        <div><span style="color: red">*</span> 选择执行任务的节点：</div>
        <el-select
          size="small"
          style="width:90%; font-size:12px"
          placeholder="选择执行节点"
          :disabled="readOnly"
          :value="model.machine"
          :multiple="true"
          :filterable="true"
          @change="(e) => onChange('machine', e)"
        >
          <el-option v-for="(machineValue, machineIndex) in execMachine" :key="machineIndex" :label="machineValue.hostName" :value="machineValue.hostName" />
        </el-select>
      </div>
      <div class="panelRow">
        <el-checkbox
          size="small"
          :disabled="model.assignType !== 'role' && model.assignType !== 'department' && (
            model.assignValue===undefined ||
            model.assignValue===null ||
            model.assignValue.length <= 1 ||
            model.activeOrder ||
            readOnly)"
          :value="model.isCounterSign"
          @change="(e) => { onChange('isCounterSign', e); initCounterSign(e) }"
        >{{ i18n['handleNode.counterSign'] }}</el-checkbox>
        <el-checkbox
          size="small"
          :disabled="
            model.assignValue===undefined||
              model.assignValue===null||
              model.assignValue.length <= 1||
              model.isCounterSign||
              readOnly"
          :value="model.activeOrder"
          @change="(value) => onChange('activeOrder', value)"
        >{{ i18n['handleNode.activeOrder'] }}</el-checkbox>
        <el-checkbox
          v-if="(model.assignType === 'role' || model.assignType === 'department') &&
            model.assignValue!==undefined &&
            model.assignValue!==null &&
            model.assignValue.length >= 1 &&
            model.isCounterSign"
          size="small"
          :value="model.fullHandle"
          @change="(value) => onChange('fullHandle', value)"
        >{{ i18n['userTask.fullHandle'] }}</el-checkbox>
      </div>
      <NodeDetail
        :model="model"
        :on-change="onChange"
        :read-only="readOnly"
        :readonly-preview="false"
        :users="users"
      />
    </div>
  </div>
</template>
<script>
import DefaultDetail from './DefaultDetail'
import NodeDetail from './NodeDetail'
export default {
  inject: ['i18n'],
  components: {
    DefaultDetail,
    NodeDetail
  },
  props: {
    model: {
      type: Object,
      default: () => ({})
    },
    users: {
      type: Array,
      default: () => ([])
    },
    roles: {
      type: Array,
      default: () => ([])
    },
    groups: {
      type: Array,
      default: () => ([])
    },
    departments: {
      type: Array,
      default: () => ([])
    },
    tasks: {
      type: Array,
      default: () => ([])
    },
    execMachine: {
      type: Array,
      default: () => ([])
    },
    onChange: {
      type: Function,
      default: () => {}
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      variableOptions: [{
        value: 1,
        label: '创建者'
      }, {
        value: 2,
        label: '创建者负责人'
      }],
      roleList: []
    }
  },

  methods: {
    getPersons(e) {
      if (e === undefined || e === null || e.length <= 1) {
        this.onChange('activeOrder', false)
        this.onChange('isCounterSign', false)
      }
    },
    initCounterSign(e) {
      if (!e) {
        this.onChange('fullHandle', false)
      }
    },
    assignmentType() {
      this.onChange('isCounterSign', false)
    }
  }
}
</script>
