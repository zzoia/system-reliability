using ReliabilityModel.Model.Formatters.Filtering;

namespace ReliabilityModel.Model.Formatters
{
    public class ShortGraphFormatter : GraphFormatter
    {
        public ShortGraphFormatter(StateFilteringStrategy stateFilteringStrategy) : base(
            stateFilteringStrategy,
            state => $"{state.Index}{GetStateSuffix(state)}")
        {

        }
    }
}