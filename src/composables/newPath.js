import { ref } from 'vue'

export const findWay = () => {

    let path = ref()

    const getRandomWeightedNumber = () => {
        const numbers = [0, 0, 1, 1, 2, 2, 3, 3, 3];
        const index = Math.floor(Math.random() * numbers.length);
        return numbers[index];
    }

    const findPath = (number) => {
        let randomIndex;
        path.value = []

        // const matrix = [];
        // for (let i = 0; i < number; i++) {
        //     matrix[i] = [];
        //     for (let j = 0; j < 8; j++) {
        //         matrix[i][j] = `${i}-${j}`;
        //     }
        // }

        // const m = matrix.length;
        const m = number;
        const n = 8;
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // 左、右、上、下
        const visited = Array(m).fill(null).map(() => Array(n).fill(false));

        const dfs = (x, y) => {
            if (x < 0 || x >= m || y < 0 || y >= n || visited[x][y]) {
                return false;
            }

            visited[x][y] = true;
            path.value.push(`${x + 1}-${y + 1}`);

            // if is end
            if (x === m - 1) {
                return true;
            }

            // min path length
            if (path.value.length >= 30 && x === m - 1) {
                return true;
            }

            // random direction
            randomIndex = getRandomWeightedNumber()
            const [dx, dy] = directions[randomIndex];

            if (dfs(x + dx, y + dy)) {
                return true;
            }

            // if this direction is fail then try another
            for (let i = 0; i < directions.length; i++) {
                if (i !== randomIndex && dfs(x + directions[i][0], y + directions[i][1])) {
                    return true;
                }
            }

            // if all direction is fail then go back
            visited[x][y] = false;
            path.value.pop();
            return false;
        }

        dfs(0, Math.floor(Math.random() * n));

        return path;
    }

    return {
        path,
        findPath
    }
}
