import difficulties from '@/utils/difficulties'

// 构造函数
const MineSweeper = function (difficultyId = 1) {
  selectDifficulty.call(this, difficultyId)
}

function selectDifficulty (difficultyId) {
  this.difficulty = difficulties.find(difficulty => difficulty.id === difficultyId)
  const { row, col, mines } = this.difficulty
  this.map = generateMap(row, col, mines)
  this.finished = false
}

// 选择难度
MineSweeper.prototype.selectDifficulty = selectDifficulty

// 初始化扫雷二维数组
function generateMap (row, col, mines) {
  const map = []

  // 初始化二维数组
  for (let i = 0; i < row; i++) {
    const line = []
    for (let j = 0; j < col; j++) {
      line.push({
        row: i,
        col: j,
        isMine: false, // 有没有雷
        active: false, // 是否高亮
        mineCountAround: 0, // 周围雷数量
        flag: false, // 是否插旗
        question: false // 是否显示问号
      })
    }
    map.push(line)
  }

  // 随机生成雷
  let count = 0
  while (count < mines) {
    const row2 = Math.floor(Math.random() * row)
    const col2 = Math.floor(Math.random() * col)
    const grid = map[row2][col2]
    if (!grid.isMine) {
      grid.isMine = true
      count++
    }
  }

  return map
}

// 自定义迭代器
MineSweeper.prototype[Symbol.iterator] = function () {
  const { row, col } = this.difficulty
  const _this = this
  let i = 0
  let j = 0

  return {
    next () {
      if (j < col - 1) {
        return { done: false, value: _this.map[i][j++] }
      }
      if (i < row - 1) {
        j = 0
        return { done: false, value: _this.map[i++][j] }
      }
      return { done: true }
    }
  }
}

// 插旗/显示问号（active，flag，question互斥）
MineSweeper.prototype.setFlagQuestion = function (row, col) {
  const grid = this.map[row][col]

  if (!grid.active) {
    if (grid.flag) {
      grid.flag = false
      grid.question = true
    } else if (grid.question) {
      grid.question = false
    } else {
      grid.flag = true
    }
  }
}

// 扫雷（返回是否已完成）
MineSweeper.prototype.sweep = function (row, col) {
  const grid = this.map[row][col]
  if (grid.active) {
    return { finished: false, error: false }
  }
  if (!grid.isMine) {
    const finished = this.sweepMines(row, col)
    if (finished) {
      return { finished: true, error: false }
    }
    return { finished: false, error: false }
  } else {
    this.showAllMines()
    return { finished: false, error: true }
  }
}

// 获取周围方格
MineSweeper.prototype.getGridsAround = function (row, col) {
  let grids = [
    { row: row - 1, col: col - 1 },
    { row: row - 1, col },
    { row: row - 1, col: col + 1 },
    { row, col: col - 1 },
    { row, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row + 1, col },
    { row: row + 1, col: col + 1 }
  ]
  grids = grids
    .filter(grid => grid.row >= 0 && grid.row < this.difficulty.row && grid.col >= 0 && grid.col < this.difficulty.col)
    .map(grid => this.map[grid.row][grid.col])
  return grids
}

// 获取周围雷数量
MineSweeper.prototype.getMineCountAround = function (row, col) {
  const grids = this.getGridsAround(row, col)
  return grids.reduce((count, grid) => {
    if (grid.isMine) {
      return count + 1
    }
    return count
  }, 0)
}

// 排雷（显示雷数量，如果周围方格有0，则对周围方格重复此操作）
MineSweeper.prototype.sweepMines = function (row, col) {
  const grid = this.map[row][col]
  if (grid.active) {
    return false
  }
  grid.active = true
  grid.mineCountAround = this.getMineCountAround(row, col)
  if (grid.mineCountAround === 0) {
    const gridsAround = this.getGridsAround(row, col)
    gridsAround.forEach(grid => {
      this.sweepMines(grid.row, grid.col)
    })
  }
  return this.checkFinished()
}

// 显示所有雷
MineSweeper.prototype.showAllMines = function () {
  this.finished = true
  for (const grid of this) {
    if (grid.isMine) {
      grid.active = true
    }
  }
}

// 检查是否已完成
MineSweeper.prototype.checkFinished = function () {
  for (const grid of this) {
    if (!grid.isMine && !grid.active) {
      return false
    }
  }
  this.finished = true
  return true
}

export default MineSweeper
