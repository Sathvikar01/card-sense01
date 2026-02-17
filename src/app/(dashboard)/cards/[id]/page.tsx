import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ExternalLink,
  Award,
  Gift,
  Plane,
  Shield,
  DollarSign,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { formatCurrency } from '@/lib/utils/format-currency'
import type { CreditCard } from '@/types/credit-card'
import { getLocalCreditCardById, isMissingCreditCardsTableError } from '@/lib/cards/local-catalog'

interface PageProps {
  params: Promise<{ id: string }>
}

interface CardQueryResult {
  data: Record<string, unknown> | null
  error: { message?: string } | null
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: card, error } = (await supabase
    .from('credit_cards')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()) as CardQueryResult

  const fallbackCard =
    isMissingCreditCardsTableError(error?.message) ? getLocalCreditCardById(id) : null

  const resolvedCard = card ?? fallbackCard

  if (error && !fallbackCard) {
    notFound()
  }

  if (!resolvedCard) {
    notFound()
  }

  const cardData = resolvedCard as unknown as CreditCard

  const formatCardType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatFee = (fee: number) => {
    if (fee === 0) return 'Free'
    return formatCurrency(fee, { showDecimals: false })
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-4">
        <Link href="/cards">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cards
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{cardData.bank_name}</p>
                <CardTitle className="text-3xl">{cardData.card_name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{formatCardType(cardData.card_type)}</Badge>
                  <Badge variant="secondary">{cardData.card_network.toUpperCase()}</Badge>
                  {cardData.popularity_score >= 90 && (
                    <Badge className="bg-blue-600">Popular</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center py-4">
              <CreditCardVisual
                cardId={cardData.id}
                size="lg"
                cardName={cardData.card_name}
                bankName={cardData.bank_name}
                interactive
              />
            </div>

            {cardData.description && (
              <p className="text-muted-foreground">{cardData.description}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Joining Fee</span>
                <span className="font-semibold">{formatFee(cardData.joining_fee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Annual Fee</span>
                <span className="font-semibold">{formatFee(cardData.annual_fee)}</span>
              </div>
              {cardData.annual_fee_waiver_spend && cardData.annual_fee_waiver_spend > 0 && (
                <>
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground">Fee Waiver on</span>
                    <span className="text-right">
                      {formatCurrency(cardData.annual_fee_waiver_spend, { showDecimals: false })}
                      <br />
                      <span className="text-xs text-muted-foreground">annual spend</span>
                    </span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Base Rewards</span>
                <span className="font-semibold">{cardData.reward_rate_default}%</span>
              </div>
              {cardData.min_income_salaried && (
                <>
                  <Separator />
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Min Income</span>
                    <span className="font-semibold">
                      {formatCurrency(cardData.min_income_salaried, { compact: true, showDecimals: false })}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {cardData.apply_url && (
            <Button className="w-full" size="lg" asChild>
              <a href={cardData.apply_url} target="_blank" rel="noopener noreferrer">
                Apply Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cardData.pros && cardData.pros.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cardData.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {cardData.cons && cardData.cons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {cardData.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {cardData.best_for && cardData.best_for.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Best For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cardData.best_for.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Reward Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Base Reward Rate</span>
                  <span className="text-lg font-bold">{cardData.reward_rate_default}%</span>
                </div>

                {cardData.reward_rate_categories && Object.keys(cardData.reward_rate_categories).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold">Category-wise Rewards</h4>
                      <div className="grid gap-2">
                        {Object.entries(cardData.reward_rate_categories).map(([category, reward]) => (
                          <div key={category} className="flex justify-between items-center p-2 border rounded">
                            <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                            <div className="text-right">
                              <span className="font-semibold">{reward.rate}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                {reward.unit === 'points_per_100' ? 'pts/100' :
                                 reward.unit === 'percent_cashback' ? '% cashback' :
                                 '% waiver'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {cardData.milestone_benefits && Object.keys(cardData.milestone_benefits).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Milestone Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(cardData.milestone_benefits).map(([key, milestone]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{milestone.benefit}</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            Value: {formatCurrency(milestone.value, { showDecimals: false })}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(milestone.spend_threshold, { compact: true, showDecimals: false })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          {cardData.welcome_benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Welcome Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cardData.welcome_benefits.description && (
                    <p className="text-sm">{cardData.welcome_benefits.description}</p>
                  )}
                  <div className="grid gap-2">
                    {cardData.welcome_benefits.vouchers?.map((voucher, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{voucher.brand}</span>
                        <span className="font-semibold">{formatCurrency(voucher.value, { showDecimals: false })}</span>
                      </div>
                    ))}
                    {cardData.welcome_benefits.points && cardData.welcome_benefits.points > 0 && (
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>Welcome Points</span>
                        <span className="font-semibold">{cardData.welcome_benefits.points.toLocaleString()} points</span>
                      </div>
                    )}
                    {cardData.welcome_benefits.cashback && cardData.welcome_benefits.cashback > 0 && (
                      <div className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>Welcome Cashback</span>
                        <span className="font-semibold">{formatCurrency(cardData.welcome_benefits.cashback, { showDecimals: false })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Lounge Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold capitalize">{cardData.lounge_access}</span>
              </div>
              {cardData.lounge_visits_per_quarter > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Visits per Quarter</span>
                  <span className="font-semibold">{cardData.lounge_visits_per_quarter}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(cardData.travel_insurance_cover ||
            cardData.purchase_protection_cover ||
            cardData.golf_access ||
            cardData.concierge_service) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance & Premium Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cardData.travel_insurance_cover && cardData.travel_insurance_cover > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Travel Insurance</span>
                    <span className="font-semibold">
                      {formatCurrency(cardData.travel_insurance_cover, { compact: true, showDecimals: false })}
                    </span>
                  </div>
                )}
                {cardData.purchase_protection_cover && cardData.purchase_protection_cover > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Purchase Protection</span>
                    <span className="font-semibold">
                      {formatCurrency(cardData.purchase_protection_cover, { compact: true, showDecimals: false })}
                    </span>
                  </div>
                )}
                {cardData.golf_access && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Golf Access</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                )}
                {cardData.concierge_service && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Concierge Service</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(cardData.fuel_surcharge_waiver || cardData.movie_benefits || cardData.dining_benefits) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cardData.fuel_surcharge_waiver && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Fuel Surcharge Waiver</span>
                    </div>
                    {cardData.fuel_surcharge_waiver_cap && (
                      <p className="text-sm text-muted-foreground ml-6">
                        Cap: {formatCurrency(cardData.fuel_surcharge_waiver_cap, { showDecimals: false })}
                      </p>
                    )}
                  </div>
                )}
                {cardData.movie_benefits && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Movie Benefits</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{cardData.movie_benefits}</p>
                  </div>
                )}
                {cardData.dining_benefits && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Dining Benefits</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{cardData.dining_benefits}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Joining Fee</span>
                  <p className="text-lg font-semibold">{formatFee(cardData.joining_fee)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Annual Fee</span>
                  <p className="text-lg font-semibold">{formatFee(cardData.annual_fee)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Renewal Fee</span>
                  <p className="text-lg font-semibold">{formatFee(cardData.renewal_fee)}</p>
                </div>
                {cardData.annual_fee_waiver_spend && cardData.annual_fee_waiver_spend > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Fee Waiver Spend</span>
                    <p className="text-lg font-semibold">
                      {formatCurrency(cardData.annual_fee_waiver_spend, { showDecimals: false })}
                    </p>
                  </div>
                )}
              </div>
              {cardData.forex_markup && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Forex Markup</span>
                    <span className="font-semibold">{cardData.forex_markup}%</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardData.min_income_salaried && (
                  <div>
                    <span className="text-sm text-muted-foreground">Min Income (Salaried)</span>
                    <p className="font-semibold">
                      {formatCurrency(cardData.min_income_salaried, { compact: true, showDecimals: false })}
                    </p>
                  </div>
                )}
                {cardData.min_income_self_employed && (
                  <div>
                    <span className="text-sm text-muted-foreground">Min Income (Self-Employed)</span>
                    <p className="font-semibold">
                      {formatCurrency(cardData.min_income_self_employed, { compact: true, showDecimals: false })}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Min CIBIL Score</span>
                  <p className="font-semibold">{cardData.min_cibil_score}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Age Requirement</span>
                  <p className="font-semibold">{cardData.min_age} - {cardData.max_age} years</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {cardData.requires_itr ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">ITR Required</span>
                </div>
                <div className="flex items-center gap-2">
                  {cardData.requires_existing_relationship ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Existing Banking Relationship Required</span>
                </div>
                <div className="flex items-center gap-2">
                  {cardData.emi_conversion_available ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">EMI Conversion Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
