'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { PlaceGuideBadges } from '@/components/place-guide-badges'
import type { PlannerPlace, PlannerQuestion } from '@/lib/planner-data'

type PlannerPageClientProps = {
  questions: PlannerQuestion[]
  places: PlannerPlace[]
}

type Answers = Record<number, number | number[]>

type PlannerProfile = {
  tags: Set<string>
  wants: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  budget: number
  group: number
  alcoholPref: number
  energetic: boolean
}

type TimeSlot = {
  time: string
  title: string
  description: string
}

type RecommendationGroup = {
  label: string
  places: PlannerPlace[]
}

const TAG_MAP = {
  food: {
    0: ['fish', 'seafood'],
    1: ['meat'],
    2: ['vegetarian'],
    3: ['seafood'],
    4: ['local', 'food'],
  },
  seaStyle: {
    0: ['beach', 'sea'],
    1: ['quiet', 'sea'],
    2: ['budget'],
    3: ['central'],
    4: ['party'],
  },
  activities: {
    0: ['sea'],
    1: ['history'],
    2: ['nature', 'adventure'],
    3: ['shopping'],
    4: ['culture'],
  },
} as const

const SLOT_TO_CATEGORIES = {
  breakfast: ['kahvalti', 'cafe', 'restoran'],
  morningActivity: ['plaj', 'gezi', 'tarih', 'doga', 'dalis', 'aktivite'],
  lunch: ['restoran', 'cafe'],
  afternoon: ['carsi', 'gezi', 'doga', 'tarih'],
  dinner: ['restoran', 'meyhane'],
  night: ['bar', 'cafe', 'meyhane'],
} as const

const WEIGHTS = {
  tagMatch: 6,
  budgetMatch: 4,
  ratingBoost: 1.5,
} as const

function buildProfile(answers: Answers): PlannerProfile {
  const profile: PlannerProfile = {
    tags: new Set<string>(),
    wants: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    budget: typeof answers[18] === 'number' ? answers[18] : 1,
    group: typeof answers[17] === 'number' ? answers[17] : 1,
    alcoholPref: typeof answers[2] === 'number' ? answers[2] : 0,
    energetic: answers[3] === 0,
  }

  const meals = Array.isArray(answers[10]) ? answers[10] : []
  profile.wants.breakfast = meals.includes(0)
  profile.wants.lunch = meals.includes(1)
  profile.wants.dinner = meals.includes(2)

  for (const index of Array.isArray(answers[9]) ? answers[9] : []) {
    for (const tag of TAG_MAP.food[index as keyof typeof TAG_MAP.food] ?? []) {
      profile.tags.add(tag)
    }
  }

  for (const index of Array.isArray(answers[11]) ? answers[11] : []) {
    for (const tag of TAG_MAP.seaStyle[index as keyof typeof TAG_MAP.seaStyle] ?? []) {
      profile.tags.add(tag)
    }
  }

  for (const index of Array.isArray(answers[12]) ? answers[12] : []) {
    for (const tag of TAG_MAP.activities[index as keyof typeof TAG_MAP.activities] ?? []) {
      profile.tags.add(tag)
    }
  }

  if ([2, 3, 4].includes(profile.alcoholPref)) {
    profile.tags.add('alcohol')
  }

  if (profile.group === 2) {
    profile.tags.add('family')
  }

  if (profile.group >= 3) {
    profile.tags.add('group')
  }

  if (answers[21] === 0) {
    profile.tags.add('photo')
  }

  return profile
}

function scorePlace(place: PlannerPlace, profile: PlannerProfile) {
  let score = 0

  for (const tag of profile.tags) {
    if (place.tags.includes(tag)) {
      score += WEIGHTS.tagMatch
    }
  }

  if (typeof place.budget === 'number') {
    const diff = Math.abs(place.budget - profile.budget)
    if (diff === 0) {
      score += WEIGHTS.budgetMatch
    } else if (diff === 1) {
      score += WEIGHTS.budgetMatch * 0.5
    }
  }

  if (typeof place.rating === 'number' && place.rating > 0) {
    score += Math.min(place.rating * WEIGHTS.ratingBoost, 8)
  }

  return score
}

function pickTopPlacesForSlot(slotKey: keyof typeof SLOT_TO_CATEGORIES, profile: PlannerProfile, places: PlannerPlace[], limit: number) {
  const allowedCategories = SLOT_TO_CATEGORIES[slotKey]
  const pool = places.filter((place) => allowedCategories.includes(place.categoryId as never))

  return (pool.length ? pool : places)
    .map((place) => ({ place, score: scorePlace(place, profile) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.place)
}

function buildItinerary(answers: Answers): TimeSlot[] {
  const prefersSea = Array.isArray(answers[12]) && answers[12].includes(0)
  const prefersHistory = Array.isArray(answers[12]) && answers[12].includes(1)
  const prefersNature = Array.isArray(answers[12]) && answers[12].includes(2)
  const wantsSiesta = answers[14] === 0
  const prefersBar = answers[15] === 0
  const likesDance = answers[16] === 0
  const likesMeat = Array.isArray(answers[9]) && answers[9].includes(1)

  const itinerary: TimeSlot[] = [
    {
      time: '08:00 - 10:00',
      title: 'Güne kahvaltıyla başla',
      description: 'Manzaralı bir başlangıç yap, yerel ürünlerle dolu uzun bir kahvaltı ya da hızlı bir kahve molasıyla güne ısın.',
    },
  ]

  if (prefersSea) {
    itinerary.push({
      time: '10:30 - 13:00',
      title: 'Sabah aktivitesi: Deniz ve koy zamanı',
      description: 'Kalabalık artmadan plaj ya da koy tarafına geç. Sabah saatleri Kaş denizinin en sakin ve berrak hali için en iyi zaman.',
    })
  } else if (prefersHistory) {
    itinerary.push({
      time: '10:30 - 13:00',
      title: 'Sabah aktivitesi: Tarih rotası',
      description: "Antik kent, tiyatro veya Kaş'ın merkez içi tarih duraklarıyla daha kültürel bir sabah planla.",
    })
  } else if (prefersNature) {
    itinerary.push({
      time: '10:30 - 13:00',
      title: 'Sabah aktivitesi: Doğa ve manzara',
      description: 'Daha hareketli bir rota istiyorsan kısa yürüyüş, manzara noktaları veya açık hava keşfi için bu bloğu kullan.',
    })
  } else {
    itinerary.push({
      time: '10:30 - 13:00',
      title: 'Sabah aktivitesi: Serbest keşif',
      description: 'Çarşı, sahil ve birkaç kısa durakla Kaş ritmini ağır ağır yakala.',
    })
  }

  itinerary.push({
    time: '13:30 - 15:00',
    title: 'Öğle yemeği',
    description: likesMeat
      ? 'Daha doyurucu, uzun oturmalı bir öğle yemeği için et veya zengin tabaklı seçeneklere yönel.'
      : 'Hafif ve ferah bir öğle için deniz mahsulleri, zeytinyağlılar veya sebze ağırlıklı tabaklar seç.',
  })

  itinerary.push(
    wantsSiesta
      ? {
          time: '15:30 - 17:00',
          title: 'Siesta ve yavaş tempo',
          description: 'Sıcaktan bir adım geri çekilip otelde, sahilde ya da sakin bir kafede dinlenme bloğu bırak.',
        }
      : {
          time: '15:30 - 17:30',
          title: 'Öğleden sonra keşfi',
          description: "Çarşı, küçük dükkânlar, kahve molası ve kısa yürüyüşler için Kaş'ın en rahat saatlerinden biri.",
        },
  )

  itinerary.push({
    time: '18:30 - 20:30',
    title: 'Akşamüstü manzarası ve yemek',
    description: 'Gün batımına denk gelen bir masa bul ve akşamı daha uzun, daha keyifli bir yemekle kapat.',
  })

  itinerary.push(
    prefersBar
      ? {
          time: '21:30 - Gece',
          title: 'Gece planı: Barlar ve canlı atmosfer',
          description: 'Enerji devam ediyorsa barlar bölgesine veya canlı müzik tarafına geçerek günü hareketli kapat.',
        }
      : likesDance
        ? {
            time: '21:30 - Gece',
            title: 'Gece planı: Dans ve ritim',
            description: 'Daha hareketli bir kapanış için müzik ve dans odaklı bir program seç.',
          }
        : {
            time: '21:30 - Gece',
            title: 'Gece planı: Sakin kapanış',
            description: 'Sahilde kısa yürüyüş, kahve veya hafif bir içkiyle günü sakin biçimde bitir.',
          },
  )

  return itinerary
}

function buildRecommendations(profile: PlannerProfile, places: PlannerPlace[]): RecommendationGroup[] {
  const groups: RecommendationGroup[] = []

  if (profile.wants.breakfast) {
    groups.push({ label: 'Kahvaltı', places: pickTopPlacesForSlot('breakfast', profile, places, 2) })
  }

  groups.push({ label: 'Sabah Aktivitesi', places: pickTopPlacesForSlot('morningActivity', profile, places, 2) })

  if (profile.wants.lunch) {
    groups.push({ label: 'Öğle', places: pickTopPlacesForSlot('lunch', profile, places, 2) })
  }

  groups.push({ label: 'Öğleden Sonra', places: pickTopPlacesForSlot('afternoon', profile, places, 2) })

  if (profile.wants.dinner) {
    groups.push({ label: 'Akşam', places: pickTopPlacesForSlot('dinner', profile, places, 2) })
  }

  groups.push({ label: 'Gece', places: pickTopPlacesForSlot('night', profile, places, 2) })

  return groups.filter((group) => group.places.length > 0)
}

function isAnswered(question: PlannerQuestion, answer: Answers[number] | undefined) {
  if (question.type === 'checkbox') {
    return Array.isArray(answer) && answer.length > 0
  }

  return typeof answer === 'number'
}

function PlannerPlaceSignals({ place }: { place: PlannerPlace }) {
  return (
    <div className="planner-place-signals">
      <span
        className={`planner-place-signal${place.address ? ' is-active' : ' is-muted'}`}
        aria-label={`Adres ${place.address ? 'var' : 'yok'}`}
        title={`Adres ${place.address ? 'var' : 'yok'}`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="9" r="2.4" fill="currentColor" />
        </svg>
      </span>
      <span
        className={`planner-place-signal${place.phone ? ' is-active' : ' is-muted'}`}
        aria-label={`Telefon ${place.phone ? 'var' : 'yok'}`}
        title={`Telefon ${place.phone ? 'var' : 'yok'}`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            d="M6.8 3.5h2.6c.5 0 .9.3 1 .7l.8 3.2c.1.4 0 .8-.3 1l-1.7 1.4a14.4 14.4 0 0 0 5 5l1.4-1.7c.3-.3.7-.4 1-.3l3.2.8c.5.1.8.5.8 1v2.6c0 .6-.5 1.1-1.1 1.1C10.7 19.8 4.2 13.3 4.2 4.6c0-.6.5-1.1 1.1-1.1z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={`planner-place-signal${place.website ? ' is-active' : ' is-muted'}`}
        aria-label={`Website ${place.website ? 'var' : 'yok'}`}
        title={`Website ${place.website ? 'var' : 'yok'}`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  )
}

export function PlannerPageClient({ questions, places }: PlannerPageClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const profile = useMemo(() => buildProfile(answers), [answers])
  const itinerary = useMemo(() => buildItinerary(answers), [answers])
  const recommendationGroups = useMemo(() => buildRecommendations(profile, places), [places, profile])

  function handleSingleSelect(optionIndex: number) {
    setShowValidation(false)
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionIndex,
    }))

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((value) => Math.min(value + 1, questions.length - 1))
    }
  }

  function handleCheckboxToggle(optionIndex: number) {
    setShowValidation(false)
    setAnswers((previous) => {
      const currentValues = Array.isArray(previous[currentQuestion.id]) ? [...(previous[currentQuestion.id] as number[])] : []
      const nextValues = currentValues.includes(optionIndex)
        ? currentValues.filter((value) => value !== optionIndex)
        : [...currentValues, optionIndex]

      return {
        ...previous,
        [currentQuestion.id]: nextValues,
      }
    })
  }

  function validateStep() {
    const valid = isAnswered(currentQuestion, currentAnswer)
    setShowValidation(!valid)
    return valid
  }

  function goNext() {
    if (!validateStep()) {
      return
    }

    setCurrentQuestionIndex((value) => Math.min(value + 1, questions.length - 1))
  }

  function goPrev() {
    setShowValidation(false)
    setCurrentQuestionIndex((value) => Math.max(value - 1, 0))
  }

  function handleSubmit() {
    if (!validateStep()) {
      return
    }

    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetPlanner() {
    setSubmitted(false)
    setShowValidation(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
  }

  return (
    <main className="planner-page">
      {!submitted ? (
        <section className="planner-shell">
          <div className="planner-header">
            <h1 className="planner-title">25 Soruda Kaş&apos;ta Bir Gününü Planla</h1>
            <p className="planner-subtitle">25 soruya cevap ver tüm gününü birlikte planlayalım!</p>
            <div className="planner-progress-track" aria-label="İlerleme">
              <div className="planner-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="planner-progress-label">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>

          <div className="planner-question-card">
            <div className="planner-question-topline">
              <h2 className="planner-question-text">{currentQuestion.text}</h2>
            </div>

            {currentQuestion.type === 'checkbox' ? (
              <div className="planner-option-grid planner-option-grid-checkbox">
                {currentQuestion.options.map((option, index) => {
                  const selected = Array.isArray(currentAnswer) && currentAnswer.includes(index)
                  return (
                    <label key={option} className={`planner-check-option ${selected ? 'is-selected' : ''}`}>
                      <input type="checkbox" checked={selected} onChange={() => handleCheckboxToggle(index)} />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="planner-option-grid">
                {currentQuestion.options.map((option, index) => {
                  const selected = currentAnswer === index
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`planner-action ${selected ? 'planner-action-primary' : 'planner-action-secondary'} planner-action-unified`}
                      onClick={() => handleSingleSelect(index)}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}

            {showValidation ? (
              <p className="planner-validation">Bu soru zorunlu. Devam etmek için en az bir seçim yapın.</p>
            ) : null}
          </div>

          <div className="planner-actions">
            <button type="button" className="planner-action planner-action-secondary" onClick={goPrev} disabled={currentQuestionIndex === 0}>
              Önceki
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button type="button" className="planner-action planner-action-primary" onClick={goNext}>
                Sonraki soru
              </button>
            ) : (
              <button type="button" className="planner-action planner-action-primary" onClick={handleSubmit}>
                Planımı oluştur
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="planner-results-shell">
          <div className="planner-results-hero">
            <div>
              <h1 className="planner-title planner-title-results">Özelleştirilmiş Kaş Günün Hazır</h1>
              <p className="planner-subtitle">
                Cevaplarınıza göre oluşturulan rota ve mekan önerileri aşağıda. İsterseniz planı sıfırlayıp farklı bir profil de deneyebilirsiniz.
              </p>
            </div>
            <div className="planner-results-actions">
              <button type="button" className="planner-action planner-action-secondary planner-action-unified" onClick={resetPlanner}>
                Baştan başla
              </button>
              <Link href="/" className="planner-action planner-action-secondary planner-action-link planner-action-unified">
                Ana sayfaya dön
              </Link>
            </div>
          </div>

          <div className="planner-results-grid">
            <section className="planner-itinerary-panel">
              <h2>Günlük akış</h2>
              <div className="planner-itinerary-list">
                {itinerary.map((slot) => (
                  <article key={`${slot.time}-${slot.title}`} className="planner-itinerary-card">
                    <span className="planner-itinerary-time">{slot.time}</span>
                    <h3>{slot.title}</h3>
                    <span className="planner-card-separator" aria-hidden="true" />
                    <p>{slot.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="planner-recommendations-panel">
              <h2>Mekan önerileri</h2>
              {recommendationGroups.length > 0 ? (
                <div className="planner-recommendation-groups">
                  {recommendationGroups.map((group) => (
                    <section key={group.label} className="planner-recommendation-group">
                      <h3>{group.label}</h3>
                      <span className="planner-card-separator" aria-hidden="true" />
                      <div className="planner-recommendation-list">
                        {group.places.map((place) => (
                          <article key={`${group.label}-${place.id}`} className="planner-recommendation-card">
                            <div className="planner-recommendation-copy">
                              <p className="planner-recommendation-category">{place.categoryLabel}</p>
                              <h4>{place.name}</h4>
                              <p>{place.shortDescription}</p>
                            </div>
                            <div className="planner-recommendation-meta">
                              <PlannerPlaceSignals place={place} />
                              {place.badges.length > 0 ? (
                                <div className="planner-recommendation-badges">
                                  <span className="planner-recommendation-badges-label">Kaş Guide</span>
                                  <PlaceGuideBadges badges={place.badges} variant="card" ariaLabel="Kaş Guide badgeleri" />
                                </div>
                              ) : null}
                              <Link href={`/mekan/${place.slug}`}>Mekan sayfasını aç</Link>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="planner-fallback-card">
                  <h3>Henüz yeterli öneri yok</h3>
                  <p>
                    Yayınlanmış mekan verisi eksik olsa bile planner çalışmaya devam eder. Bu durumda günlük akışı kullanıp ana sayfadan kategori bazlı keşfe devam edebilirsiniz.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}
    </main>
  )
}
