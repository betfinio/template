import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: Index
})

function Index() {
	// const {t} = useTranslation('', {keyPrefix: 'template'})
	return <div className={'border border-red-500 px-4 py-2 rounded-md text-white h-full'}>
		hey
	</div>
}