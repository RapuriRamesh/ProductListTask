document.addEventListener('DOMContentLoaded', function() {
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarItems = document.querySelector('.navbar-items');

  navbarToggle.addEventListener('click', function() {
      navbarItems.classList.toggle('active');
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("products-grid");
  const paginationContainer = document.querySelector(".pagination");
  const cartCountElement = document.querySelector(".cart-count");
  const filterCategoryCheckboxes = document.querySelectorAll(".filter-button");
  const filterPriceCheckboxes = document.querySelectorAll(".filter-price");
  const sortPriceSelect = document.getElementById("sortPrice");
  const searchInput = document.getElementById("searchInput");
  const loadingIndicator = document.getElementById("loading-indicator");

  let allProducts = [];
  let currentProducts = [];
  let cart = [];
  let currentPage = 1;
  const itemsPerPage = 8;

  // Fetch all products initially
  fetchProducts();

  // Fetch products from the API
  function fetchProducts() {
    showLoadingIndicator();
    fetch("https://fakestoreapi.com/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((products) => {
        allProducts = products;
        currentProducts = products;
        displayProducts(currentProducts, currentPage);
        setupPagination(currentProducts);
        hideLoadingIndicator();
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        displayError("Failed to fetch products. Please try again later.");
        hideLoadingIndicator();
      });
  }

  // Function to display products for a specific page
  function displayProducts(products, page) {
    productGrid.innerHTML = "";
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedProducts = products.slice(startIndex, endIndex);

    displayedProducts.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product");

      const heartContainer = document.createElement("div");
      heartContainer.classList.add("heart-container");
      heartContainer.innerHTML = `
        <svg class="heart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="black" stroke-width="2" fill="none"/>
        </svg>
      `;
      const heartPath = heartContainer.querySelector("path");

      if (cart.some((item) => item.id === product.id)) {
        heartPath.setAttribute("fill", "red");
      }

      heartContainer.addEventListener("click", () => {
        if (heartPath.getAttribute("fill") === "red") {
          heartPath.setAttribute("fill", "none");
          removeFromCart(product.id);
        } else {
          heartPath.setAttribute("fill", "red");
          addToCart(product);
        }
      });

      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-price">$${product.price}</p>
      `;
      productElement.appendChild(heartContainer);
      productGrid.appendChild(productElement);
    });
  }

  // Function to setup pagination links
  function setupPagination(products) {
    paginationContainer.innerHTML = "";
    const numPages = Math.ceil(products.length / itemsPerPage);
    for (let i = 1; i <= numPages; i++) {
      const pageLink = document.createElement("a");
      pageLink.href = "javascript:void(0);";
      pageLink.textContent = i;

      if (i === currentPage) {
        pageLink.classList.add("active");
      }

      pageLink.addEventListener("click", () => {
        currentPage = i;
        displayProducts(products, currentPage);
        updateActivePageLink();
      });

      paginationContainer.appendChild(pageLink);
    }
  }

  // Function to update the active page link styling
  function updateActivePageLink() {
    const pageLinks = document.querySelectorAll(".pagination a");
    pageLinks.forEach((link) => {
      link.classList.remove("active");
      if (parseInt(link.textContent) === currentPage) {
        link.classList.add("active");
      }
    });
  }

  // Event listener for category filters
  filterCategoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      filterProducts();
    });
  });

  // Event listener for price filters
  filterPriceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      filterProducts();
    });
  });

  // Function to filter products based on selected categories and prices
  function filterProducts() {
    const selectedCategories = Array.from(filterCategoryCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.dataset.category);
    
    const selectedPriceRanges = Array.from(filterPriceCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value.split('-').map(Number));
    
    currentProducts = allProducts.filter((product) => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category.toLowerCase());
      const priceMatch = selectedPriceRanges.length === 0 || selectedPriceRanges.some(([min, max]) => product.price >= min && product.price <= max);
      return categoryMatch && priceMatch;
    });

    displayProducts(currentProducts, currentPage);
    setupPagination(currentProducts);
  }

  // Event listener for price sorting
  sortPriceSelect.addEventListener("change", () => {
    const sortBy = sortPriceSelect.value;
    sortProductsByPrice(sortBy);
  });

  // Function to sort products by price
  function sortProductsByPrice(sortBy) {
    if (sortBy === "asc") {
      currentProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "desc") {
      currentProducts.sort((a, b) => b.price - a.price);
    } else {
      currentProducts = allProducts;
    }
    displayProducts(currentProducts, currentPage);
  }

  // Function to search products based on input value
  function searchProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === "") {
      currentProducts = allProducts;
    } else {
      currentProducts = allProducts.filter((product) =>
        product.title.toLowerCase().includes(searchTerm)
      );
    }
    displayProducts(currentProducts, currentPage);
    setupPagination(currentProducts);
  }

  // Event listener for search input
  const searchIcon = document.querySelector(".search-icon");
  searchIcon.addEventListener("click", searchProducts);

  // Show loading indicator
  function showLoadingIndicator() {
    loadingIndicator.style.display = "block";
  }

  // Hide loading indicator
  function hideLoadingIndicator() {
    loadingIndicator.style.display = "none";
  }

  // Display error message
  function displayError(message) {
    productGrid.innerHTML = `<p class="error-message">${message}</p>`;
  }
});

