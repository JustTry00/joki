// ============================================
// AUTO-ANSWER SCRIPT FOR ED.ENGDIS - FINAL
// ============================================

;(() => {
  console.log("🎯 Loading Auto-Answer Script (Final Version 3)...")

  let isProcessing = false
  let currentTaskIndex = 0
  const processedTasks = new Set()
  let injectedAnswerBox = null
  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let boxStartX = 0
  let boxStartY = 0

  const getToken = () => {
    const names = ["EDAPPToken", "EDAPPTokeb"]
    for (const name of names) {
      const token = localStorage.getItem(name)
      if (token) return token.trim()
    }
    return null
  }

  const waitForElement = (selector, timeout = 10000) => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          observer.disconnect()
          resolve(element)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      setTimeout(() => {
        observer.disconnect()
        resolve(null)
      }, timeout)
    })
  }

  const getCurrentTask = () => {
    try {
      if (window.lesson?.steps) {
        const step = window.lesson.steps.find((i) => i.Name === "450" || i.Name === "Test")
        if (step?.tasks?.[currentTaskIndex]) {
          return step.tasks[currentTaskIndex]
        }
      }

      if (window.learningArea?.currentTask) {
        return window.learningArea.currentTask
      }

      return null
    } catch (err) {
      console.error("❌ Error getting current task:", err)
      return null
    }
  }

  const resolveImageUrl = (answerId, questionId, media) => {
    if (!media || !media.m || !media.res) return undefined

    const mappingId = `${questionId}_${answerId}`
    const mapping = media.m.find((m) => m.id === mappingId)
    if (!mapping || !mapping.r || mapping.r.length === 0) return undefined

    const resourceId = mapping.r[0].rid
    const resource = media.res.find((r) => r.id === resourceId)
    if (!resource) return undefined

    const basePath = "https://static.engdis.com/edprod01/edprod//runtime/GraphicsAng/Reading/fdrobo/"
    return resource.src.startsWith("http") ? resource.src : `${basePath}${resource.src}`
  }

  const extractAnswers = (data) => {
    const result = []

    if (!data?.i || !data.i.q || !Array.isArray(data.i.q)) {
      console.warn("⚠️ Invalid response structure")
      return result
    }

    const questions = data.i.q
    const mediaInfo = data.i.media

    for (const [qIndex, question] of questions.entries()) {
      if (!question.al || !Array.isArray(question.al)) continue

      const questionId = question.id || qIndex + 1
      const questionType = question.t || 0
      const answers = []

      try {
        // FORMAT 1: Fill in the blank tanpa opsi (langsung isi kata)
        const isFillInBlankFormat1 = question.al.every((al) => al.a?.[0]?.txt && !("c" in al.a[0]))

        if (isFillInBlankFormat1) {
          console.log(`📝 Q${questionId}: Format 1 - Fill-in-blank (direct text)`)

          const sortedAnswerLists = [...question.al].sort((a, b) => {
            const idA = a.id || 0
            const idB = b.id || 0
            return idA - idB
          })

          for (const al of sortedAnswerLists) {
            const answer = al.a?.[0]
            if (answer?.txt) {
              answers.push({
                id: String(al.id || answers.length + 1),
                txt: answer.txt.trim(),
              })
            }
          }
        }
        // FORMAT 2: Dropdown / pilihan kata (multiple blanks dengan opsi)
        else if (question.al.length > 1 && question.al.every((al) => al.a?.some((a) => "c" in a) && al.t !== 4)) {
          console.log(`📝 Q${questionId}: Format 2 - Dropdown/word selection`)

          for (const al of question.al) {
            const correct = al.a?.find((a) => a.c === "1" || a.c === 1)
            if (correct?.txt) {
              answers.push({
                id: String(correct.id),
                txt: correct.txt.trim(),
              })
            }
          }
        }
        // FORMAT 4: Pilihan bergambar (image-based)
        else if (question.al[0]?.t === 4 && mediaInfo) {
          console.log(`📝 Q${questionId}: Format 4 - Image-based selection`)

          const correctIndex = question.al[0].a?.findIndex((a) => a.c === "1" || a.c === 1)

          if (correctIndex !== undefined && correctIndex >= 0) {
            const imageUrl = resolveImageUrl(correctIndex + 1, questionId, mediaInfo)

            if (imageUrl) {
              answers.push({
                id: String(correctIndex + 1),
                txt: `Image option ${correctIndex + 1}`,
                img: imageUrl,
              })
            } else {
              console.warn(`⚠️ Q${questionId}: Could not resolve image URL for index ${correctIndex}`)
            }
          }
        }
        // CHECK for FORMAT 5 or FORMAT 3
        else if (question.al[0]?.a && Array.isArray(question.al[0].a)) {
          const correctAnswers = question.al[0].a.filter((a) => a.c === "1" || a.c === 1)

          // FORMAT 5: Multiple correct answers
          if (correctAnswers.length > 1) {
            console.log(`📝 Q${questionId}: Format 5 - Multiple correct answers (${correctAnswers.length} answers)`)

            for (const c of correctAnswers) {
              if (c.txt) {
                answers.push({
                  id: String(c.id),
                  txt: c.txt.trim(),
                  img: c.img,
                })
              }
            }
          }
          // FORMAT 3: Single correct answer
          else if (correctAnswers.length === 1) {
            console.log(`📝 Q${questionId}: Format 3 - Multiple choice (single answer)`)

            const correct = correctAnswers[0]
            if (correct?.txt) {
              answers.push({
                id: String(correct.id),
                txt: correct.txt.trim(),
                img: correct.img,
              })
            }
          }
        }
        // Fallback: coba ekstrak jawaban apapun yang punya c="1"
        else {
          console.log(`📝 Q${questionId}: Fallback extraction`)

          for (const al of question.al) {
            if (!al.a || !Array.isArray(al.a)) continue

            for (const answer of al.a) {
              const isCorrect = answer.c === "1" || answer.c === 1
              if (isCorrect && answer.txt) {
                answers.push({
                  id: String(answer.id),
                  txt: answer.txt.trim(),
                  img: answer.img,
                })
              }
            }
          }
        }

        if (answers.length > 0) {
          result.push({
            questionId,
            questionType,
            answers,
          })
          console.log(`✅ Q${questionId}: Extracted ${answers.length} answer(s)`)
        } else {
          console.warn(`⚠️ Q${questionId}: No answers extracted`)
        }
      } catch (err) {
        console.error(`🚨 Error processing Q${questionId}:`, err)
      }
    }

    return result
  }

  const createAnswerBox = () => {
    const box = document.createElement("div")
    box.id = "auto-answer-display"
    box.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      color: #1e293b;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      z-index: 2147483647;
      width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideInRight 0.3s ease-out;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid #e2e8f0;
      cursor: move;
      pointer-events: auto;
    `

    if (!document.getElementById("answer-box-styles")) {
      const style = document.createElement("style")
      style.id = "answer-box-styles"
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .answer-item {
          animation: fadeIn 0.2s ease-out backwards;
        }
        .answer-item:nth-child(1) { animation-delay: 0.05s; }
        .answer-item:nth-child(2) { animation-delay: 0.1s; }
        .answer-item:nth-child(3) { animation-delay: 0.15s; }
        .answer-item:nth-child(4) { animation-delay: 0.2s; }
        .answer-box-collapsed {
          width: 56px !important;
          height: 56px !important;
          border-radius: 50% !important;
          padding: 0 !important;
          cursor: pointer;
        }
        .answer-box-collapsed > *:not(.toggle-btn) {
          display: none !important;
        }
        .toggle-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `
      document.head.appendChild(style)
    }

    box.addEventListener("mousedown", (e) => {
      const target = e.target
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest(".answer-item")
      ) {
        return
      }

      e.preventDefault()
      isDragging = true
      dragStartX = e.clientX
      dragStartY = e.clientY
      const rect = box.getBoundingClientRect()
      boxStartX = rect.left
      boxStartY = rect.top
      box.style.transition = "none"
      box.style.cursor = "grabbing"
      box.style.userSelect = "none"
    })

    document.addEventListener("mousemove", (e) => {
      if (!isDragging || !injectedAnswerBox) return

      e.preventDefault()
      const deltaX = e.clientX - dragStartX
      const deltaY = e.clientY - dragStartY
      const newX = Math.max(0, Math.min(window.innerWidth - box.offsetWidth, boxStartX + deltaX))
      const newY = Math.max(0, Math.min(window.innerHeight - box.offsetHeight, boxStartY + deltaY))

      box.style.left = `${newX}px`
      box.style.top = `${newY}px`
      box.style.right = "auto"
      box.style.bottom = "auto"
    })

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false
        if (injectedAnswerBox) {
          injectedAnswerBox.style.transition = "all 0.3s ease"
          injectedAnswerBox.style.cursor = "move"
          injectedAnswerBox.style.userSelect = "auto"
        }
      }
    })

    return box
  }

  const showAnswersInBox = (questions) => {
    if (injectedAnswerBox) {
      injectedAnswerBox.remove()
    }

    injectedAnswerBox = createAnswerBox()

    const toggleBtn = document.createElement("button")
    toggleBtn.className = "toggle-btn"
    toggleBtn.innerHTML = "✨"
    toggleBtn.style.cssText = `
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      z-index: 10;
      position: relative;
    `

    let isCollapsed = false
    toggleBtn.onclick = (e) => {
      e.stopPropagation()
      isCollapsed = !isCollapsed

      if (isCollapsed) {
        injectedAnswerBox?.classList.add("answer-box-collapsed")
        toggleBtn.innerHTML = "📝"
      } else {
        injectedAnswerBox?.classList.remove("answer-box-collapsed")
        toggleBtn.innerHTML = "✨"
      }
    }

    toggleBtn.onmouseover = () => {
      toggleBtn.style.transform = "scale(1.05)"
      toggleBtn.style.boxShadow = "0 6px 16px rgba(139, 92, 246, 0.4)"
    }
    toggleBtn.onmouseout = () => {
      toggleBtn.style.transform = "scale(1)"
      toggleBtn.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.3)"
    }

    const header = document.createElement("div")
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
    `

    const title = document.createElement("h3")
    title.textContent = "Jawaban Benar"
    title.style.cssText = `
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    `

    const buttonGroup = document.createElement("div")
    buttonGroup.style.cssText = `
      display: flex;
      gap: 6px;
    `

    const refreshBtn = document.createElement("button")
    refreshBtn.innerHTML = "🔄"
    refreshBtn.title = "Refresh answers"
    refreshBtn.style.cssText = `
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #16a34a;
      font-size: 14px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: bold;
    `
    refreshBtn.onclick = async () => {
      refreshBtn.innerHTML = "⏳"
      refreshBtn.disabled = true
      refreshBtn.style.opacity = "0.6"

      try {
        const task = getCurrentTask()
        if (task) {
          console.log("🔄 Manual refresh triggered...")

          const taskKey = `${task.id}-${task.code}`
          processedTasks.delete(taskKey)

          if (injectedAnswerBox) {
            injectedAnswerBox.remove()
            injectedAnswerBox = null
          }

          await processTask(task.id, task.code)
        } else {
          console.warn("⚠️ No current task found for refresh")
        }
      } catch (err) {
        console.error("🚨 Refresh failed:", err)
      } finally {
        refreshBtn.innerHTML = "🔄"
        refreshBtn.disabled = false
        refreshBtn.style.opacity = "1"
      }
    }
    refreshBtn.onmouseover = () => {
      if (!refreshBtn.disabled) {
        refreshBtn.style.background = "#dcfce7"
      }
    }
    refreshBtn.onmouseout = () => {
      if (!refreshBtn.disabled) {
        refreshBtn.style.background = "#f0fdf4"
      }
    }

    const minimizeBtn = document.createElement("button")
    minimizeBtn.innerHTML = "_"
    minimizeBtn.style.cssText = `
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      padding: 0;
      line-height: 1;
    `
    minimizeBtn.onclick = () => {
      isCollapsed = true
      injectedAnswerBox?.classList.add("answer-box-collapsed")
      toggleBtn.innerHTML = "📝"
    }
    minimizeBtn.onmouseover = () => {
      minimizeBtn.style.background = "#f1f5f9"
    }
    minimizeBtn.onmouseout = () => {
      minimizeBtn.style.background = "#f8fafc"
    }

    const closeBtn = document.createElement("button")
    closeBtn.innerHTML = "✕"
    closeBtn.style.cssText = `
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #ef4444;
      font-size: 14px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: bold;
    `
    closeBtn.onmouseover = () => {
      closeBtn.style.background = "#fee2e2"
    }
    closeBtn.onmouseout = () => {
      closeBtn.style.background = "#fef2f2"
    }
    closeBtn.onclick = () => {
      if (injectedAnswerBox) {
        injectedAnswerBox.style.animation = "slideOutRight 0.3s ease-out"
        setTimeout(() => {
          if (injectedAnswerBox) injectedAnswerBox.remove()
        }, 300)
      }
    }

    buttonGroup.appendChild(refreshBtn)
    buttonGroup.appendChild(minimizeBtn)
    buttonGroup.appendChild(closeBtn)
    header.appendChild(title)
    header.appendChild(buttonGroup)

    const contentWrapper = document.createElement("div")
    contentWrapper.style.cssText = `
      padding: 12px;
    `

    const answerList = document.createElement("div")
    answerList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    `

    questions.forEach((questionData) => {
      const questionSection = document.createElement("div")
      questionSection.style.cssText = `
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 8px;
      `

      const questionHeader = document.createElement("div")
      questionHeader.style.cssText = `
        font-weight: 600;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #f1f5f9;
      `

      const answerCountText = questionData.answers.length > 1 ? ` (${questionData.answers.length} jawaban)` : ""
      questionHeader.textContent = `Pertanyaan ${questionData.questionId}${answerCountText}`

      questionSection.appendChild(questionHeader)

      questionData.answers.forEach((answer, index) => {
        const answerItem = document.createElement("div")
        answerItem.className = "answer-item"
        answerItem.style.cssText = `
          background: #f8fafc;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          margin-bottom: 6px;
        `

        const contentDiv = document.createElement("div")
        contentDiv.style.cssText = `
          display: flex;
          align-items: flex-start;
          gap: 8px;
        `

        const answerNumber = document.createElement("span")
        answerNumber.textContent = `${index + 1}`
        answerNumber.style.cssText = `
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          color: white;
          font-weight: 600;
          font-size: 11px;
          min-width: 22px;
          height: 22px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        `

        const textContainer = document.createElement("div")
        textContainer.style.cssText = `
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        `

        const answerText = document.createElement("span")
        answerText.textContent = answer.txt
        answerText.style.cssText = `
          font-size: 13px;
          line-height: 1.4;
          color: #1e293b;
          word-break: break-word;
        `

        textContainer.appendChild(answerText)

        if (answer.img) {
          const imgElement = document.createElement("img")
          imgElement.src = answer.img
          imgElement.alt = "Image Answer"
          imgElement.style.cssText = `
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin-top: 6px;
            border: 1px solid #e2e8f0;
          `
          imgElement.onerror = () => {
            console.warn(`⚠️ Failed to load image: ${answer.img}`)
            imgElement.style.display = "none"
            const errorText = document.createElement("span")
            errorText.textContent = "[Image failed to load]"
            errorText.style.cssText = `
              font-size: 11px;
              color: #ef4444;
              font-style: italic;
            `
            textContainer.appendChild(errorText)
          }
          textContainer.appendChild(imgElement)
        }

        const copyBtn = document.createElement("button")
        copyBtn.innerHTML = "📋"
        copyBtn.title = "Copy"
        copyBtn.style.cssText = `
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 4px 6px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
          flex-shrink: 0;
        `
        copyBtn.onclick = (e) => {
          e.stopPropagation()
          navigator.clipboard.writeText(answer.txt)
          copyBtn.innerHTML = "✓"
          copyBtn.style.background = "#dcfce7"
          copyBtn.style.borderColor = "#86efac"
          setTimeout(() => {
            copyBtn.innerHTML = "📋"
            copyBtn.style.background = "white"
            copyBtn.style.borderColor = "#e2e8f0"
          }, 1500)
        }

        contentDiv.appendChild(answerNumber)
        contentDiv.appendChild(textContainer)
        contentDiv.appendChild(copyBtn)
        answerItem.appendChild(contentDiv)

        answerItem.onmouseover = () => {
          answerItem.style.background = "#f1f5f9"
          answerItem.style.borderColor = "#cbd5e1"
          answerItem.style.transform = "translateX(-2px)"
        }
        answerItem.onmouseout = () => {
          answerItem.style.background = "#f8fafc"
          answerItem.style.borderColor = "#e2e8f0"
          answerItem.style.transform = "translateX(0)"
        }

        answerItem.onclick = () => {
          const inputs = document.querySelectorAll(
            "input[type='text'], input:not([type='radio']):not([type='checkbox'])",
          )
          if (inputs.length > 0) {
            const emptyInput = Array.from(inputs).find((inp) => !inp.value)
            if (emptyInput) {
              emptyInput.value = answer.txt
              emptyInput.dispatchEvent(new Event("input", { bubbles: true }))
              emptyInput.dispatchEvent(new Event("change", { bubbles: true }))
              emptyInput.style.outline = "2px solid #22c55e"

              answerItem.style.background = "#dcfce7"
              answerItem.style.borderColor = "#86efac"
              setTimeout(() => {
                answerItem.style.background = "#f8fafc"
                answerItem.style.borderColor = "#e2e8f0"
                emptyInput.style.outline = ""
              }, 1000)

              console.log(`✅ Auto-filled: "${answer.txt}"`)
              return
            }
          }

          try {
            const radioCheckboxes = document.querySelectorAll("input[type='radio'], input[type='checkbox']")

            for (const input of Array.from(radioCheckboxes)) {
              if (input.value.trim().toLowerCase() === answer.txt.trim().toLowerCase()) {
                input.checked = true
                input.dispatchEvent(new Event("change", { bubbles: true }))
                input.dispatchEvent(new Event("click", { bubbles: true }))

                answerItem.style.background = "#dcfce7"
                answerItem.style.borderColor = "#86efac"
                setTimeout(() => {
                  answerItem.style.background = "#f8fafc"
                  answerItem.style.borderColor = "#e2e8f0"
                }, 1000)

                console.log(`✅ Auto-selected: "${answer.txt}"`)
                return
              }

              const label = input.id ? document.querySelector(`label[for="${input.id}"]`) : input.closest("label")

              if (label) {
                const labelText = label.textContent?.trim().toLowerCase() || ""
                if (
                  labelText === answer.txt.trim().toLowerCase() ||
                  labelText.includes(answer.txt.trim().toLowerCase())
                ) {
                  input.checked = true
                  input.dispatchEvent(new Event("change", { bubbles: true }))
                  input.dispatchEvent(new Event("click", { bubbles: true }))

                  answerItem.style.background = "#dcfce7"
                  answerItem.style.borderColor = "#86efac"
                  setTimeout(() => {
                    answerItem.style.background = "#f8fafc"
                    answerItem.style.borderColor = "#e2e8f0"
                  }, 1000)

                  console.log(`✅ Auto-selected: "${answer.txt}"`)
                  return
                }
              }
            }

            const buttons = document.querySelectorAll("button, [role='button'], .answer-option, .choice-item")

            for (const btn of Array.from(buttons)) {
              const btnText = btn.textContent?.trim().toLowerCase() || ""
              if (btnText === answer.txt.trim().toLowerCase() || btnText.includes(answer.txt.trim().toLowerCase())) {
                btn.click()

                answerItem.style.background = "#dcfce7"
                answerItem.style.borderColor = "#86efac"
                setTimeout(() => {
                  answerItem.style.background = "#f8fafc"
                  answerItem.style.borderColor = "#e2e8f0"
                }, 1000)

                console.log(`✅ Auto-clicked: "${answer.txt}"`)
                return
              }
            }

            console.warn(`⚠️ Could not auto-fill/select: "${answer.txt}"`)
          } catch (err) {
            console.error("Error auto-selecting:", err)
          }
        }

        questionSection.appendChild(answerItem)
      })

      answerList.appendChild(questionSection)
    })

    contentWrapper.appendChild(answerList)

    const footer = document.createElement("div")
    footer.style.cssText = `
      padding: 12px 16px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
    `

    const totalAnswers = questions.reduce((sum, q) => sum + q.answers.length, 0)
    const statsDiv = document.createElement("div")
    statsDiv.innerHTML = `${questions.length} soal, ${totalAnswers} jawaban`

    const tipDiv = document.createElement("div")
    tipDiv.textContent = "Klik untuk isi"

    footer.appendChild(statsDiv)
    footer.appendChild(tipDiv)

    injectedAnswerBox.appendChild(toggleBtn)
    injectedAnswerBox.appendChild(header)
    injectedAnswerBox.appendChild(contentWrapper)
    injectedAnswerBox.appendChild(footer)

    document.body.appendChild(injectedAnswerBox)
    console.log(`📦 Answer box injected with ${questions.length} questions`)
  }

  const processTask = async (taskId, taskCode) => {
    const taskKey = `${taskId}-${taskCode}`

    if (processedTasks.has(taskKey)) {
      console.log(`⏭️ Task ${taskKey} sudah diproses, skip.`)
      return false
    }

    const token = getToken()
    if (!token) {
      console.error("❌ Token tidak ditemukan di localStorage.")
      return false
    }

    const url = `https://edwebservices.engdis.com/api/practiceManager/GetItem/${taskId}/${taskCode}/23/0/6`
    console.log(`🔍 Fetching task: ${taskKey}`)

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)

      const data = await res.json()
      console.log(`📦 Response received for task ${taskKey}`)

      const questionsData = extractAnswers(data)

      if (questionsData.length === 0) {
        console.warn(`⚠️ No answers extracted from task ${taskKey}`)
        return false
      }

      let hasUnansweredInputs = false
      try {
        const textInputs = document.querySelectorAll("input[type='text'], input:not([type])")
        hasUnansweredInputs = Array.from(textInputs).some((input) => !input.value.trim())
      } catch (e) {
        console.warn("Error checking inputs:", e)
      }

      if (hasUnansweredInputs || questionsData.length > 0) {
        console.log(`📌 Displaying answer box with ${questionsData.length} question(s)...`)
        showAnswersInBox(questionsData)
      } else {
        console.log(`✅ All answers highlighted successfully`)
      }

      processedTasks.add(taskKey)
      return true
    } catch (err) {
      console.error(`🚨 Failed to process task ${taskKey}:`, err)
      return false
    }
  }

  const triggerAutoAnswer = async () => {
    if (isProcessing) {
      console.log("⏳ Sedang memproses, tunggu sebentar...")
      return
    }

    isProcessing = true
    console.log("🚀 Trigger auto-answer dimulai...")

    await waitForElement(".learning__main", 5000)
    await new Promise((r) => setTimeout(r, 1000))

    const task = getCurrentTask()
    if (!task) {
      console.warn("⚠️ Tidak dapat mendeteksi task saat ini.")
      isProcessing = false
      return
    }

    console.log(`📝 Processing task: ID=${task.id}, Code=${task.code}`)
    const success = await processTask(task.id, task.code)

    if (success) {
      console.log("✅ Auto-answer berhasil!")
      currentTaskIndex++
    } else {
      console.warn("⚠️ Auto-answer gagal atau tidak ada jawaban.")
    }

    isProcessing = false
  }

  const setupAutoTrigger = () => {
    console.log("👀 Setting up auto-trigger observer...")

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const hasQuestionContent = Array.from(mutation.addedNodes).some((node) => {
            if (node instanceof Element) {
              return (
                node.matches("[class*=question], [class*=task], [class*=answer], .learning__main") ||
                node.querySelector("[class*=question], [class*=task], [class*=answer]") !== null ||
                node.querySelector("input") !== null ||
                node.querySelector("button") !== null
              )
            }
            return false
          })

          if (hasQuestionContent && !isProcessing) {
            console.log("🔔 Soal baru terdeteksi, auto-triggering...")
            setTimeout(() => triggerAutoAnswer(), 1500)
          }
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    document.addEventListener("click", (e) => {
      const target = e.target
      if (
        target &&
        (target.classList.contains("learning__next") ||
          (target.textContent && target.textContent.toLowerCase().includes("next")) ||
          (target.textContent && target.textContent.toLowerCase().includes("continue")))
      ) {
        console.log("➡️ Next button clicked, waiting for new question...")
        setTimeout(() => triggerAutoAnswer(), 2000)
      }
    })

    console.log("✅ Auto-trigger observer active and persistent!")
  }

  const initialize = () => {
    console.log("🔄 Initializing auto-answer system...")

    const checkReady = setInterval(() => {
      const isLoaded =
        document.querySelector(".learning__main") &&
        !document.querySelector(".sk-fading-circle") &&
        (window.lesson || window.learningArea)

      if (isLoaded) {
        clearInterval(checkReady)
        console.log("✅ Page loaded, starting auto-answer system...")
        setupAutoTrigger()
        setTimeout(() => triggerAutoAnswer(), 2000)
      }
    }, 500)

    setTimeout(() => {
      clearInterval(checkReady)
      if (!document.querySelector(".learning__main")) {
        console.error("❌ Timeout: Page tidak berhasil load dalam 30 detik.")
      }
    }, 30000)
  }

  const edAutoAnswer = {
    trigger: triggerAutoAnswer,
    reset: () => {
      processedTasks.clear()
      currentTaskIndex = 0
      console.log("🔄 Reset processed tasks")
    },
    hideBox: () => {
      if (injectedAnswerBox) {
        injectedAnswerBox.remove()
        injectedAnswerBox = null
        console.log("🗑️ Answer box hidden")
      }
    },
  }

  window.edAutoAnswer = edAutoAnswer

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize)
  } else {
    initialize()
  }

  console.log("✅ Auto-answer script loaded successfully!")
  console.log("📌 Available commands:")
  console.log("  - window.edAutoAnswer.trigger()  : Trigger manual")
  console.log("  - window.edAutoAnswer.reset()    : Reset history")
  console.log("  - window.edAutoAnswer.hideBox()  : Hide answer box")
})()
