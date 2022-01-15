<template>
  <div class="mine-sweeper">
    <div class="layout-top">
      <div class="duration">{{ durationText }}</div>
      <button @click="onRestart">重新开始</button>
      <div class="difficulty-wrapper">
        <span>难度：</span>
        <select @change="onSelectDifficulty">
          <option
            v-for="difficulty in difficulties"
            :key="difficulty.id"
            :value="difficulty.id">
            {{ difficulty.name }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-for="(row, i) in map"
      :key="i"
      class="row"
      @contextmenu="e => e.preventDefault()">
      <div
        v-for="(col, j) in row"
        :key="j"
        class="grid"
        :class="{
          active: map[i][j].active,
          error: i === errorGrid[0] && j === errorGrid[1],
          flag: map[i][j].flag
        }"
        @click="onClickGrid(i, j)"
        @contextmenu="onContextMenu(i, j)">
        <template v-if="map[i][j].active">
          <template v-if="map[i][j].isMine">
            <span class="iconfont icon-boom"></span>
          </template>
          <template v-else-if="map[i][j].mineCountAround">{{ map[i][j].mineCountAround }}</template>
        </template>
        <template v-else-if="map[i][j].flag">
          <span class="iconfont icon-flag"></span>
        </template>
        <template v-else-if="map[i][j].question">
          <div>?</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import MineSweeper from '@/classes/MineSweeper'
import difficulties from '@/utils/difficulties'

export default {
  data () {
    return {
      difficulties,
      difficulty: 1,
      mineSweeper: null,
      map: [],
      timer: null,
      duration: 0,
      errorGrid: [-1, -1] // 踩雷方格
    }
  },
  computed: {
    durationText () {
      const minute = Math.floor(this.duration / 60)
      const second = this.duration % 60
      return `${minute > 9 ? minute : '0' + minute}:${second > 9 ? second : '0' + second}`
    },
    finished () {
      return this.mineSweeper?.finished
    }
  },
  created () {
    this.initial()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },
  beforeDestroy () {
    this.clearTimer()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  },
  methods: {
    initial () {
      if (this.mineSweeper) {
        this.mineSweeper.selectDifficulty(this.difficulty)
      } else {
        this.mineSweeper = new MineSweeper(this.difficulty)
      }
      this.map = this.mineSweeper.map
      this.setTimer()
    },
    setTimer () {
      this.timer = setInterval(() => {
        this.duration++
      }, 1000)
    },
    clearTimer () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    // 页面隐藏时暂停计时
    onVisibilityChange () {
      if (document.visibilityState === 'hidden' && !this.finished) {
        this.clearTimer()
      }
      if (document.visibilityState === 'visible' && !this.finished) {
        this.setTimer()
      }
    },

    // 左键
    onClickGrid (row, col) {
      if (!this.finished) {
        const { finished, error } = this.mineSweeper.sweep(row, col)
        if (finished || error) {
          this.clearTimer()
          if (error) {
            this.errorGrid = [row, col]
          } else {
            alert('已完成')
          }
        }
      }
    },
    // 右键
    onContextMenu (row, col) {
      if (!this.finished) {
        this.mineSweeper.setFlagQuestion(row, col)
      }
    },
    // 重新开始
    onRestart () {
      this.clearTimer()
      this.duration = 0
      this.errorGrid = [-1, -1]
      this.initial()
    },
    // 选择难度
    onSelectDifficulty (e) {
      this.difficulty = +e.target.value
      this.onRestart()
    }
  }
}
</script>

<style scoped lang="less">
@import './assets/iconfonts/iconfont.css';

.mine-sweeper {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .layout-top {
    width: 600px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.row {
  display: flex;
  .grid {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #c5c5c5;
    font-weight: 700;
    border: 3px solid;
    border-color: #fff #808080 #808080 #fff;
    &:active,
    &.active {
      background-color: #bfbfbf;
      border-color: #808080 #bfbfbf #bfbfbf #808080;
    }
    &.error {
      background-color: #f00;
      border-color: #c00 #f55 #f55 #800;
    }
    &.flag {
      color: #00f;
    }
  }
}
</style>
