// �������� ������
function createParticles() {
  const particlesContainer = document.getElementById("particles");
  const particleCount = 60;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    const size = Math.random() * 5 + 2;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particlesContainer.appendChild(particle);
  }
}
// ��������
function initCarousel() {
  const carouselInner = document.getElementById("carouselInner");
  const dots = document.querySelectorAll(".carousel-dot");
  let currentIndex = 0;
  function goToSlide(index) {
    if (index < 0) index = dots.length - 1;
    if (index >= dots.length) index = 0;
    carouselInner.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot) => dot.classList.remove("active"));
    dots[index].classList.add("active");
    currentIndex = index;
  }
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
    });
  });
  setInterval(() => {
    goToSlide(currentIndex + 1);
  }, 5000);
}
// ��� ��� ������ � ���������
const githubDataCache = {
  downloads: null,
  version: null,
  timestamp: null,
  ttl: 10 * 60 * 1000, // 10 �����
};
// �������� ������ � ������ � ���������� �������� ����� GitHub API
async function loadGitHubData() {
  try {
    const now = Date.now();
    if (
      githubDataCache.downloads &&
      githubDataCache.timestamp &&
      now - githubDataCache.timestamp < githubDataCache.ttl
    ) {
      document.getElementById("downloads-count").textContent =
        githubDataCache.downloads;
      document.getElementById("latest-version").textContent =
        githubDataCache.version;
      // Добавляем отображение звезд из кэша, если есть
      if (githubDataCache.stars) {
        document.getElementById("stars-count").textContent =
          githubDataCache.stars;
      }
      return;
    }

    document.getElementById("downloads-count").textContent = "...";

    let allReleases = [];
    let url =
      "https://api.github.com/repos/MaKrotos/Music-M/releases?per_page=100";
    let latestVersion = "Unknown";

    // Получаем информацию о репозитории для количества звезд
    const repoResponse = await fetch(
      "https://api.github.com/repos/MaKrotos/Music-M"
    );
    if (!repoResponse.ok) {
      throw new Error(`HTTP error! status: ${repoResponse.status}`);
    }
    const repoData = await repoResponse.json();
    const starsCount = repoData.stargazers_count;

    // Форматируем количество звезд
    let formattedStars = "0";
    if (starsCount >= 1000) {
      formattedStars = (starsCount / 1000).toFixed(1) + "k";
    } else {
      formattedStars = starsCount.toString();
    }

    // Отображаем количество звезд
    document.getElementById("stars-count").textContent = formattedStars;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const releases = await response.json();
      allReleases = allReleases.concat(releases);

      // Получаем последнюю версию из первого набора релизов
      if (releases.length > 0 && latestVersion === "Unknown") {
        latestVersion = releases[0].tag_name || "Unknown";
        document.getElementById("latest-version").textContent = latestVersion;

        // Обновляем ссылки для скачивания
        const downloadLinks = document.querySelectorAll(
          'a.btn[id^="download-"]'
        );
        downloadLinks.forEach((link) => {
          const currentHref = link.getAttribute("href");
          const newHref = currentHref.replace(
            /\/download\/[^/]+\//,
            `/download/${latestVersion}/`
          );
          link.setAttribute("href", newHref);
        });
      }

      // Обрабатываем пагинацию
      const linkHeader = response.headers.get("Link");
      url = null;
      if (linkHeader) {
        const links = linkHeader.split(",");
        const nextLink = links.find((link) => link.includes('rel="next"'));
        if (nextLink) {
          url = nextLink.match(/<([^>]+)>/)[1];
        }
      }
    }

    // Подсчитываем общее количество скачиваний
    let formattedCount = "0+";
    if (allReleases.length > 0) {
      let totalDownloads = 0;
      for (const release of allReleases) {
        for (const asset of release.assets) {
          totalDownloads += asset.download_count;
        }
      }

      if (totalDownloads >= 1000000) {
        formattedCount = (totalDownloads / 1000000).toFixed(1) + "M+";
      } else if (totalDownloads >= 1000) {
        formattedCount = (totalDownloads / 1000).toFixed(1) + "K+";
      } else {
        formattedCount = totalDownloads.toString() + "+";
      }
    }

    document.getElementById("downloads-count").textContent = formattedCount;

    // Сохраняем в кэш
    githubDataCache.downloads = formattedCount;
    githubDataCache.version = latestVersion;
    githubDataCache.stars = formattedStars;
    githubDataCache.timestamp = now;
  } catch (error) {
    console.error("Error loading GitHub data:", error);
    document.getElementById("downloads-count").textContent = "20K+";
    document.getElementById("latest-version").textContent = "v1.0.0";
    document.getElementById("stars-count").textContent = "1.2k";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  loadGitHubData();
});
setInterval(loadGitHubData, 10 * 60 * 1000);
document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  initCarousel();
  loadGitHubData();
});
