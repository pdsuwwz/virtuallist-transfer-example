<template>
  <div>提示：最多选择{{ limit }} 个项目</div>
  <PublicTransfer
    v-model:right="transferRightList"
    :dataset="dataset"
    key-field="code"
    :limit="limit"
    @search="getAllList"
  />
</template>

<script>
import {
  defineComponent,
  ref,
} from 'vue'

export default defineComponent({
  name: 'Xx'
})
</script>

<script setup>
import PublicTransfer from './PublicTransfer/index.vue'
import { mockCompanyList } from './data'

const limit = ref(3)
const dataset = ref([])
const transferRightList = ref([])

const getAllList = () => {
  setTimeout(() => {
    transferRightList.value = [
      {
        code: '000002',
        name: '万科A'
      }, {
        code: '000008',
        name: '神州高铁'
      }
    ]
    dataset.value = mockCompanyList // 全量上市公司数据
  }, 2000)
}
getAllList()



</script>

<style lang="scss">
* {
  border: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
