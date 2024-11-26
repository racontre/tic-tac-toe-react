import '@mantine/core/styles.css'
import { Text, Container, Button, Flex, Stack, Paper } from '@mantine/core'
import { useState } from 'react'

const noop = () => {}
// [0, 1, 2, 3, 4, 5, 6, 7, 8] + offset (number (3))

// [[0,1,2], [3,4,5], [6,7,8]]
// [row[0], [31, 4,5],  row[2]]

type Player = 'X' | 'O'
type Tie = 'Tie'
type GameState = Player | Tie | 'Ongoing'
type TTTCell = { state: Player | null }
type TTTRow = [TTTCell, TTTCell, TTTCell]
type TTTGrid = [TTTRow, TTTRow, TTTRow]

// 1. При нажатии обновлять стейт:
//  ставить в кнопку Х или О и перекрасить кнопку в зеленую или красную для Х и О соответсвенно
// + обновить следующего игрока
// 2. Написать проверку на победителя + проверять Тайпскрипт типизацией
// функция должна принимать типизированные аргументы, e.g.
// function getResult(arg: TTTGrid): Player | false {}
// или: const getResult = (arg: TTTGrid): Player | false = {}
// 3. Добавить элемент с поздравлением победителя или объявлением ничьи

const INITIAL_GRID: TTTGrid = [
  [{ state: null }, { state: null }, { state: null }],
  [{ state: null }, { state: null }, { state: null }],
  [{ state: null }, { state: null }, { state: null }],
]

function updateGrid(grid: TTTGrid, row: number, column: number, player: Player): TTTGrid {
  const targetRow = grid[row]
  const targetCell = targetRow?.[column]
  if (!targetCell || !targetRow) {
    console.error('target cell is undefined')
    return grid
  }

  if (targetCell.state) return grid

  const newGrid: TTTGrid = [
    ...grid.slice(0, row),
    [...targetRow.slice(0, column), { state: player } as TTTCell, ...targetRow.slice(column + 1)],
    ...grid.slice(row + 1),
  ] as TTTGrid
  return newGrid
}

function getColor(cell: TTTCell) {
  if (cell.state === 'X') return 'green'
  if (cell.state === 'O') return 'red'
  return 'blue'
}

function getWinnerHorizontal(grid: TTTGrid): Player | null {
  const winner = grid.find((row) =>
    row.every((cell) => {
      return cell.state !== null && cell.state === row[0].state
    }),
  )?.[0].state
  if (winner) console.log('horizontal win')
  return winner ?? null
}

function getWinnerVertical(grid: TTTGrid): Player | null {
  const rotatedGrid = grid[0].map((_, index) => grid.map((row) => row[index])) as TTTGrid
  const winner = rotatedGrid.find((row) =>
    row.every((cell) => {
      return cell.state !== null && cell.state === row[0].state
    }),
  )?.[0].state
  if (winner) console.log('vertical win')
  return winner ?? null
}

function getWinnerDiagonal(grid: TTTGrid): Player | null {
  let win = true
  for (let row = 0; row < grid.length; row++) {
    if (grid[row]?.[row]?.state !== grid[0][0].state || grid[row]?.[row]?.state == null) {
      //console.log(row)
      win = false
      break
    }
  }
  if (win) {
    console.log('diagonal win')
    return grid[0]?.[0].state ?? null
  }
  win = true
  for (let row = 0; row < grid.length; row++) {
    if (
      grid[grid.length - 1 - row]?.[row]?.state !== grid[grid.length - 1]?.[0].state ||
      grid[grid.length - 1 - row]?.[row]?.state == null
    ) {
      win = false
      break
    }
  }
  if (win) {
    console.log('opposite diagonal win')
    return grid[grid.length - 1]?.[0].state ?? null
  }
  return null
}

function getTie(grid: TTTGrid): Tie | null {
  for (let column = 0; column < grid.length; column++) {
    for (let row = 0; row < grid[0].length; row++) {
      if (!grid[column]?.[row]?.state) return null
    }
  }
  let tie: Tie = 'Tie'
  return tie
}

function getResult(grid: TTTGrid): GameState {
  return (getWinnerDiagonal(grid) || getWinnerHorizontal(grid) || getWinnerVertical(grid) || getTie(grid)) ?? 'Ongoing'
}

export default function App() {
  const [grid, setGrid] = useState(INITIAL_GRID)
  const [player, setPlayer] = useState<Player>('X')
  const [gameState, setGameState] = useState<GameState>('Ongoing')

  return (
    <Container w="400px">
      <Text ta="center" size="xl" fw={1000}>
        {' '}
        Turn: {player}{' '}
      </Text>
      <Paper shadow="md" radius="md" withBorder p="xl" mt="lg" mb="lg" bg="var(--mantine-color-blue-light)">
        <Stack align="center">
          {grid.map((row, rowId) => (
            <Flex gap="10px">
              {row.map((cell, columnId) => (
                <Button
                  color={getColor(cell)}
                  w="3rem"
                  h="3rem"
                  size="compact-md"
                  onClick={
                    gameState == 'Ongoing'
                      ? () => {
                          const isOccupied = Boolean(grid[rowId]?.[columnId]?.state)
                          if (isOccupied) return

                          const newGrid = updateGrid(grid, rowId, columnId, player)
                          setGameState(getResult(newGrid))
                          setGrid(newGrid)
                          setPlayer(player === 'X' ? 'O' : 'X')
                        }
                      : noop
                  }
                >
                  <Text size="lg" fw={700}>
                    {cell.state ?? ''}
                  </Text>
                </Button>
              ))}
            </Flex>
          ))}
        </Stack>
      </Paper>
      <Text ta="center">Game State: {['X', 'O'].includes(gameState) ? `Winner: ${gameState}` : gameState}</Text>
      <Button
        onClick={() => {
          setGrid(INITIAL_GRID)
          setPlayer('X')
          setGameState('Ongoing')
        }}
      >
        Restart
      </Button>
    </Container>
  )
}
