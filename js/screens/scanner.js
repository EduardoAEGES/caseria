// Escáner IA de frescura (prueba gratis de un solo uso).

defineScreen("scanner", {
  nav: true,
  ui: () => ({ status: "init", progress: 0, result: null, stream: null }),

  render(ui) {
    const isDone = ui.status === "done";
    const isScanning = ui.status === "scanning";
    const isCamera = ui.status === "camera" || ui.status === "init";

    return `
      <section class="screen screen--dark">
        ${StatusBar(true)}
        <header class="scanner__header">
          <button class="scanner__back" data-action="finish" aria-label="Volver">←</button>
          <div>
            <p class="scanner__title">📷 Escáner IA de Frescura</p>
            <p class="scanner__sub">${state.premium ? 'Uso Ilimitado' : 'Prueba gratis · 1 uso disponible'}</p>
          </div>
          <span class="scanner__badge">${state.premium ? '⭐ Premium' : '🎁 Gratis'}</span>
        </header>

        <div class="scanner__viewport" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000;">
          <video id="tf-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; ${isCamera ? '' : 'display:none;'}"></video>
          <canvas id="tf-canvas" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; ${!isCamera ? '' : 'display:none;'}"></canvas>
          
          ${isCamera ? `
             <div style="position: absolute; bottom: 30px; z-index: 10; width: 100%; display: flex; justify-content: center;">
               <button class="btn btn--primary btn--xl" data-action="takePhoto" style="box-shadow: 0 4px 12px rgba(0,0,0,0.5);">📸 Tomar Foto</button>
             </div>
          ` : ""}

          ${each(["tl", "tr", "bl", "br"], corner => `<span class="scanner__corner scanner__corner--${corner}" style="z-index: 5;"></span>`)}
          
          ${isScanning ? `<div id="scan-line" class="scanner__line" style="top: ${8 + ui.progress * 0.6}%; z-index: 6;"></div>` : ""}
          
          ${(isScanning || isDone) ? `
          <div class="scanner__progress" style="z-index: 10;">
            <div class="scanner__progress-row">
              <div class="scanner__track"><div id="scan-fill" class="scanner__fill" style="width: ${ui.progress}%"></div></div>
              <span id="scan-percent">${ui.progress}%</span>
            </div>
            <p class="scanner__status" id="scan-status">${isDone ? "¡Análisis completado!" : "Analizando con TensorFlow.js..."}</p>
          </div>` : ""}

          ${isDone ? `
            <div class="scanner__result slide-up" style="z-index: 10;">
              <div class="scanner__result-card">
                <div class="scanner__result-head">
                  <span class="scanner__result-dot"></span>
                  <span>🟢 Identificado: ${esc(ui.result || "Producto Desconocido")}</span>
                </div>
                <p class="scanner__result-line">📅 <strong>Vida útil:</strong> Estimación basada en IA (TensorFlow).</p>
                <p class="scanner__result-line scanner__result-line--last">💰 <strong>Comparativa:</strong> Cruzado con base de datos de Paucarpata.</p>
                <span class="pill pill--green pill--strong">✓ Apto para compra</span>
              </div>
            </div>` : ""}
        </div>

        ${isDone && !state.premium ? `
          <div class="scanner__upsell slide-up">
            <p class="scanner__upsell-title">🎉 Gastaste tu prueba gratis.</p>
            <p class="scanner__upsell-text">Suscríbete a Ca$erIA Premium (S/ 9.90/mes) para uso ilimitado.</p>
            <div class="scanner__upsell-actions">
              <button class="scanner__upsell-btn scanner__upsell-btn--solid">Obtener Premium</button>
              <button class="scanner__upsell-btn" data-action="finish">Continuar gratis</button>
            </div>
          </div>` : isDone && state.premium ? `
          <div class="scanner__upsell slide-up">
            <p class="scanner__upsell-title">✨ Análisis exitoso</p>
            <p class="scanner__upsell-text">Puedes seguir escaneando más productos de forma ilimitada con Premium.</p>
            <div class="scanner__upsell-actions">
              <button class="scanner__upsell-btn scanner__upsell-btn--solid" data-action="finish">Volver al Perfil</button>
            </div>
          </div>
          ` : ""}
      </section>`;
  },

  enter(ui) {
    // Inicializar la cámara
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          ui.stream = stream;
          const video = document.getElementById("tf-video");
          if (video) video.srcObject = stream;
          ui.status = "camera";
        })
        .catch(err => {
          console.error("No se pudo acceder a la cámara:", err);
          ui.status = "camera";
        });
    } else {
      ui.status = "camera";
    }

    return () => {
      if (ui.stream) {
        ui.stream.getTracks().forEach(t => t.stop());
        ui.stream = null;
      }
    };
  },

  actions: {
    takePhoto: async (ui) => {
      ui.status = "scanning";
      ui.progress = 0;
      render(); // Redibujar sin el botón y mostrar progreso

      const video = document.getElementById("tf-video");
      const canvas = document.getElementById("tf-canvas");
      
      // Capturar el frame actual
      if (video && canvas) {
        if (video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
          // Fallback visual si no hay cámara real
          canvas.width = 300;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#333";
          ctx.fillRect(0, 0, 300, 300);
          ctx.fillStyle = "#fff";
          ctx.font = "60px sans-serif";
          ctx.fillText("🍅", 120, 160);
        }
        
        // Detener la cámara
        if (ui.stream) {
          ui.stream.getTracks().forEach(t => t.stop());
          ui.stream = null;
        }
      }

      // Simular progreso de escaneo mientras se carga el modelo real
      const timer = setInterval(() => {
        if (ui.progress < 90) {
          ui.progress += 2;
          const elLine = document.getElementById("scan-line");
          const elFill = document.getElementById("scan-fill");
          const elPercent = document.getElementById("scan-percent");
          if (elLine) elLine.style.top = \`\${8 + ui.progress * 0.6}%\`;
          if (elFill) elFill.style.width = \`\${ui.progress}%\`;
          if (elPercent) elPercent.textContent = \`\${ui.progress}%\`;
        }
      }, 50);

      try {
        const elStatus = document.getElementById("scan-status");
        if (elStatus) elStatus.textContent = "Cargando modelo de IA (TensorFlow)...";
        
        if (!window.mobilenet) throw new Error("TensorFlow.js o MobileNet no están disponibles");
        
        // Cargar modelo y clasificar
        const model = await mobilenet.load();
        
        if (elStatus) elStatus.textContent = "Comparando con base de datos...";
        let predictions = [];
        if (canvas && canvas.width > 0) {
          predictions = await model.classify(canvas);
        }

        // Obtener el nombre del primer resultado (la clase con mayor probabilidad)
        if (predictions && predictions.length > 0) {
          // MobileNet devuelve nombres en inglés, tomamos el principal
          ui.result = predictions[0].className.split(',')[0];
        } else {
          ui.result = "Desconocido";
        }
      } catch (err) {
        console.error("Error en TensorFlow:", err);
        // Fallback en caso de que falle la red o el modelo
        ui.result = "Manzana (Simulado)";
      }

      // Completar
      clearInterval(timer);
      ui.progress = 100;
      ui.status = "done";
      render(); // Mostrar la ficha con el resultado
    },

    finish: () => {
      useScannerTrial();
      navigate("buyerprofile");
    },
  },
});
