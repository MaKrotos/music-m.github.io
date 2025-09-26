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
      return;
    }
    const releasesResponse = await fetch(
      "https://api.github.com/repos/MaKrotos/Music-M/releases/latest"
    );
    const releaseData = await releasesResponse.json();
    let latestVersion = "Unknown";
    if (releaseData.tag_name) {
      latestVersion = releaseData.tag_name;
      document.getElementById("latest-version").textContent = latestVersion;
      const downloadLinks = document.querySelectorAll('a.btn[id^="download-"]');
      downloadLinks.forEach((link) => {
        const currentHref = link.getAttribute("href");
        const newHref = currentHref.replace(
          /\/download\/[^/]+\//,
          `/download/${releaseData.tag_name}/`
        );
        link.setAttribute("href", newHref);
      });
    }
    let allReleases = [];
    let url =
      "https://api.github.com/repos/MaKrotos/Music-M/releases?per_page=100";
    document.getElementById("downloads-count").textContent = "...";
    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const releases = await response.json();
      allReleases = allReleases.concat(releases);
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
    githubDataCache.downloads = formattedCount;
    githubDataCache.version = latestVersion;
    githubDataCache.timestamp = now;
  } catch (error) {
    document.getElementById("downloads-count").textContent = "20K+";
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
