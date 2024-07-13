// https://pattern.monster
const imgList = [
    './bg/002.png',
    './bg/003.png',
    './bg/004.png',
    './bg/005.png',
    './bg/006.png',
    './bg/007.png',
    './bg/008.png',
    './bg/009.png',
    './bg/0010.png',
    './bg/0011.png',
    './bg/0012.png',
    './bg/0013.png',
    './bg/0014.png',
    './bg/0015.png',
    './bg/0016.png',
    './bg/0017.png',
    './bg/0018.png',
]

export const useChangeBgImg = () => {
    let index = Math.floor(Math.random() * 17);
    const changeBgImg = () => {
        document.body.style.backgroundImage = `url(${imgList[index]})`;
    };

    return {
        changeBgImg
    }
}