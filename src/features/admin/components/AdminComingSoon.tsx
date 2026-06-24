import { Link } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

interface AdminComingSoonProps {
  title: string
  description: string
  module?: number
}

export function AdminComingSoon({ title, description, module }: AdminComingSoonProps) {
  return (
    <Card padding="lg" className="max-w-xl">
      <Construction className="mb-4 h-10 w-10 text-nh-green-600" aria-hidden="true" />
      <CardHeader title={title} description={description} />
      {module && (
        <Badge variant="info" className="mb-4">
          Módulo {module} — em breve
        </Badge>
      )}
      <Link to={ROUTES.home}>
        <Button variant="outline" size="sm">
          Voltar ao site
        </Button>
      </Link>
    </Card>
  )
}
