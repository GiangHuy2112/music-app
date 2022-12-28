const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const progress = $("#progress");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Lạc Trôi",
      singer: "Sơn Tùng",
      path: "./music/music1.mp3",
      image: "./img/image1.jpg",
    },

    {
      name: "Close Up",
      singer: "Binz - Phương Ly",
      path: "./music/music2.mp3",
      image: "./img/image2.png",
    },
    {
      name: "Nơi Tình Yêu Bắt Đầu",
      singer: "Bùi Anh Tuấn",
      path: "./music/music3.mp3",
      image: "./img/image1.jpg",
    },
    {
      name: "Nơi Tình Yêu Kết Thúc",
      singer: "Bùi Anh Tuấn",
      path: "./music/music4.mp3",
      image: "./img/image1.jpg",
    },
    {
      name: "Phải Chia Tay Thôi",
      singer: "Tuấn Hưng",
      path: "./music/music5.mp3",
      image: "./img/image1.jpg",
    },
    {
      name: "Tệ Thật, Anh Nhớ Em",
      singer: "Thanh Hưng",
      path: "./music/music6.mp3",
      image: "./img/image1.jpg",
    },
    {
      name: "Già Cùng Nhau Là Được",
      singer: "Tea, PC",
      path: "./music/music7.mp3",
      image: "./img/image1.jpg",
    },
    {
      name: "Em Muốn Ta Là Gì",
      singer: "Thanh Hưng",
      path: "./music/music8.mp3",
      image: "./img/image2.png",
    },
    {
      name: "Kẻ Cắp Gặp Bà Già",
      singer: "Hoàng Thùy Linh, Binz",
      path: "./music/music9.mp3",
      image: "./img/image2.png",
    },
    {
      name: "Cảm Giác Lúc Ấy Sẽ Ra Sao",
      singer: "Lou Hoàng",
      path: "./music/music10.mp3",
      image: "./img/image2.png",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index=${index}>
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
    });
    playList.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay / dừng
    cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 20000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to/ thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    playBtn.onclick = () => {
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    audio.onplay = () => {
      this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song được pause
    audio.onpause = () => {
      this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = () => {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua song
    progress.oninput = (e) => {
      audio.currentTime = ((e.target.value / 100) * audio.duration).toFixed(0);
      console.log(audio.currentTime);
    };

    // Khi next bài hát
    nextBtn.onclick = () => {
      if (this.isRandom) {
        this.playRandomSong();
      } else {
        this.nextSong();
      }
      audio.play();
      this.render();
      this.scrollToActiveSong();
    };

    // Khi prev bài hát
    prevBtn.onclick = () => {
      if (this.isRandom) {
        this.playRandomSong();
      } else {
        this.prevSong();
      }
      audio.play();
      this.render();
      this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    randomBtn.onclick = (e) => {
      this.isRandom = !this.isRandom;
      this.setConfig("isRandom", this.isRandom);
      randomBtn.classList.toggle("active", this.isRandom);
    };

    // Xử lý lặp lại một bài hát
    repeatBtn.onclick = () => {
      this.isRepeat = !this.isRepeat;
      this.setConfig("isRepeat", this.isRepeat);
      repeatBtn.classList.toggle("active", this.isRepeat);
    };

    // Xử lý next song khi audio ended
    audio.onended = () => {
      if (this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playList
    playList.onclick = (e) => {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        if (songNode) {
          this.currentIndex = +songNode.dataset.index;
          this.loadCurrentSong();
          audio.play();
          this.render();
        }
        // Xử lý khi click vào song options
        if (e.target.closest(".option")) {
        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;
    console.log(heading, cdThumb, audio);
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    if (this.currentIndex === 0) {
      this.currentIndex = this.songs.length - 1;
    } else this.currentIndex--;
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (this.currentIndex === newIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của btn repeat $ random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
